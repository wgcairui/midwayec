import { Provide, Scope, ScopeEnum, Init, Inject } from "@midwayjs/decorator"
import { Ec } from "../interface"
import { Cache } from "./cache"
import { Tool } from "./tool"
/**
 * 设备返回数据解析类,根据协议解析bufer
 */
@Provide()
@Scope(ScopeEnum.Singleton)
export class ProtocolParse {

  @Inject()
  Cache: Cache


  @Inject()
  Tool: Tool
  /**
   * 缓存协议方法
   */
  private protocolInstructMap: Map<string, Map<string, Uart.protocolInstruct>>
  /**
   * 序列化参数regx解析
   */
  private CacheParseRegx: Map<string, [number, number]>
  /**
   * 
   * @param ctx 总线对象
   */
  @Init()
  init() {
    this.protocolInstructMap = new Map()
    this.CacheParseRegx = new Map()
  }

  /**
   * 解析查询结果
   * @param IntructResult 设备返回数据对象数组 
   * @param protocol 设备协议名称
   * @returns 设备解析结果 
   */
  public async parse(IntructResult: Required<Ec.uartReadData>[], protocol: string): Promise<Uart.queryResultArgument[]> {
    return this.Cache.CacheProtocol.get(protocol)?.Type === 232 ?
      this.parse232(IntructResult, protocol) : this.parse485(IntructResult, protocol)
  }

  /**
   * 获取协议解析结果
   * @param protocol 协议名称
   * @returns 协议Instructs Map缓存对象
   */
  private getProtocolInstruct(protocol: string) {
    const instructMap = this.protocolInstructMap.get(protocol)
    if (!instructMap) {
      this.setProtocolInstruct(protocol)
    }
    return this.protocolInstructMap.get(protocol)!
  }
  /**
   * 设置协议解析
   * @param protocol 协议名称
   */
  private setProtocolInstruct(protocol: string) {
    const Protocol = this.Cache.CacheProtocol.get(protocol)!
    // 缓存协议方法
    this.protocolInstructMap.set(protocol, new Map(Protocol.instruct.map(el => [el.name, el])))
  }

  /**
   * 协议解析，数据存取数量尺寸缓存
   * @param regx 从buffer中截取数据的起始位和长度,例:3-2,从第三位截取两个数解析
   */
  private getProtocolRegx(regx: string) {
    const Regx = this.CacheParseRegx.get(regx)
    if (!Regx) {
      const [start, end] = regx.split("-").map(el => parseInt(el))
      this.CacheParseRegx.set(regx, [start, end]);
    }
    return this.CacheParseRegx.get(regx)!
  }

  /**
   * 处理232协议
   * @param IntructResult 设备返回数据对象数组 
   * @param protocol 设备协议名称
   * @returns 设备解析结果
   */
  private parse232(IntructResult: Required<Ec.uartReadData>[], protocol: string) {
    const InstructMap = this.getProtocolInstruct(protocol)
    return IntructResult.map(el => {
      // 解析规则
      const instructs = InstructMap.get(el.name)!
      // 把buffer转换为utf8字符串并掐头去尾
      const parseStr = Buffer.from(el.data)
        .toString("utf8", instructs.shift ? instructs.shiftNum : 0, instructs.pop ? el.data.length - instructs.popNum : el.data.length)
        .replace(/(#)/g, "")
        // 如果是utf8,分隔符为' '
        .split(instructs.isSplit ? " " : "");
      // console.log({ cont:el.content,parseStr, parseStrlen: parseStr.length, ins: instructs.formResize.length });
      return instructs.formResize.map<Uart.queryResultArgument>(el2 => {
        const [start] = this.getProtocolRegx(el2.regx!)
        const value = this.Tool.ParseFunctionValue(el2.bl, parseStr[start - 1]) as string
        return { name: el2.name, value, parseValue: el2.isState ? this.Cache.parseUnit(el2.unit!, value) : value, unit: el2.unit }
      });
    })
      .flat()
  }

  /**
   * 处理485协议
    * @param IntructResult 设备返回数据对象数组 
   * @param protocol 设备协议名称
   * @returns 设备解析结果
   */
  private parse485(IntructResult: Required<Ec.uartReadData>[], protocol: string) {
    // 获取协议指令集
    const InstructMap = this.getProtocolInstruct(protocol);
    // 刷选阶段,协议指令查询返回的结果不一定是正确的,可能存在返回报警数据,其他设备返回的数据
    // 检查1,检查返回的查询指令是否是查询协议中包含的指令
    // 2,检查协议是否是非标协议,如果是非标协议的话且有检查脚本,使用脚本检查结果buffer,返回Boolen
    // 3,检查标准modbus协议,协议返回的控制字符与查询指令一致,结果数据长度与结果中声明的数据长度一致
    // 
    const ResultFilter = IntructResult.filter(el => {
      const protocolInstruct = InstructMap.get(el.name)!
      // 如果是非标协议且含有后处理脚本，由脚本校验结果buffer
      if (protocolInstruct.noStandard && protocolInstruct.scriptEnd) {
        const Fun = this.Tool.ParseFunctionEnd(protocolInstruct.scriptEnd)
        return Fun(el.instructString, el.data) as Boolean
      } else {
        // 结果对象需要满足对应操作指令,是此协议中的指令,数据长度和结果中声明的一致
        const FunctionCode = parseInt(el.instructString.slice(2, 4))
        return (el.data[1] === FunctionCode && el.data[2] + 5 === el.data.length)
      }
    })
    //console.log(ResultFilter);
    // 根据协议指令解析类型的不同,转换裁减Array<number>为Array<number>,把content换成指令名称
    const ParseInstructResultType = ResultFilter.map(el => {
      const instructs = InstructMap.get(el.name)!
      // 掐头去尾
      const data = el.data.slice(instructs.shift ? instructs.shiftNum : 3, instructs.pop ? el.data.length - instructs.popNum : el.data.length - 2)
      switch (instructs.resultType) {
        case 'bit2':
          // 把结果字段中的10进制转换为2进制,翻转后补0至8位,代表modbus线圈状态
          // https://blog.csdn.net/qq_26093511/article/details/58628270
          // http://blog.sina.com.cn/s/blog_dc9540b00102x9p5.html

          // 1,读bit2指读线圈oil，方法为把10/16进制转为2进制,不满8位则前补0至8位，然后翻转这个8位数组，
          // 2,把连续的几个数组拼接起来，转换为数字
          // 例子：[1,0,0,0,1],[0,1,1,1,1]补0为[0,0,0,1,0,0,0,1],[0,0,0,0,1,1,1,1],数组顺序不变，每个数组内次序翻转
          // [1,0,0,0,1,0,0,0],[1,1,1,1,0,0,0,0],然后把二维数组转为一维数组
          //data.map(el2 => el2.toString(2).padStart(8, '0').split('').reverse().map(el3 => Number(el3))).flat()
          el.data = Buffer.from(data.toJSON().data.map(el2 => el2.toString(2).padStart(8, '0').split('').reverse().map(el3 => Number(el3))).flat())
          break
        default:
          el.data = data
          break
      }
      return el
    })
    // console.log(InstructMap);
    // 把转换处理后的数据根据协议指令对应的解析对象生成结果对象数组,赋值result属性
    return ParseInstructResultType.map(el => {
      const instructs = InstructMap.get(el.name)!
      const buffer = el.data
      return instructs.formResize.map(el2 => {
        // 申明结果
        const result = { name: el2.name, value: '0', unit: el2.unit, parseValue: '' }
        // 每个数据的结果地址
        const [start, len] = this.getProtocolRegx(el2.regx!)
        switch (instructs.resultType) {
          // 处理
          case 'bit2':
            result.value = buffer[start - 1].toString()
            break
          // 处理整形
          case "hex":
          case "short":
            // 如果是浮点数则转换为带一位小数点的浮点数
            const num = this.Tool.ParseCoefficient(el2.bl, buffer.readIntBE(start - 1, len))
            const str = num.toString()
            result.value = /\./.test(str) ? num.toFixed(1) : str
            break;
        }
        result.parseValue = el2.isState ? this.Cache.parseUnit(result.unit, result.value) : result.value

        return result
      })
    }).flat()
  }
}

