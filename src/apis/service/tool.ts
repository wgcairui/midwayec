import { Provide } from "@midwayjs/decorator"
import { osInfo, mem, fsSize, networkInterfaces, networkGatewayDefault } from "systeminformation"
import { pick } from "lodash"
import { crc16modbus } from "crc";

@Provide()
export class Tool {

    /**
     * 获取系统信息
     * @returns 
     */
    async os() {
        const info = await osInfo()
        return info
    }

    /**
     * 获取内存信息
     * @returns 
     */
    async osMemory() {
        const info = await mem()
        return pick(info, ["total", "free", "used"])
    }

    /**
     * 获取磁盘信息
     * @returns 
     */
    async osDisk() {
        const info = await fsSize()
        return pick(info.find(el => el.mount === '/')!, ["size", "used", "available", "use"])
    }

    /**
     * 获取网络信息
     * @returns 
     */
    async osNet() {
        const info = await networkInterfaces()
        return pick(info.find(el => el.iface === 'en0') || info[1], ["ip4", "ip4subnet", "ip6", "ip6subnet", "mac"])
    }

    /**
     * 获取网关
     * @returns 
     */
    async osGetway() {
        const info = await networkGatewayDefault()
        return info
    }

    /**
     * 获取综合信息
     * @returns 
     */
    async osDevs() {
        const disk = await this.osDisk()
        const men = await this.osMemory()
        const net = await this.osNet()
        const getway = await this.osGetway()
        return {
            disk,
            men,
            net,
            getway
        }
    }


    /**
 * 生成modbus16校验码
 * @param address modbus设备地址
 * @param instruct modbus设备指令
 * @returns crc16编码校验的查询指令
 */
    Crc16modbus(address: number, instruct: string) {
        const body = address.toString(16).padStart(2, "0") + instruct;
        const crc = crc16modbus(Buffer.from(body, "hex"))
            .toString(16)
            .padStart(4, "0");
        const [a, b, c, d] = [...crc];
        return body + c + d + a + b;
    }

    /**
     * 使用于非标协议前置脚本,转换脚本为Function
     * @param fun 代码文本
     */
    ParseFunction(fun: string) {
        const content = fun.replace(/(^function\(pid,instruct\)\{|\}$)/g, '')
        return new Function('pid', 'instruct', content)
    }

    /**
     * 适用于非标协议后置脚本
     * @param fun 代码文本
     */
    ParseFunctionEnd(fun: string) {
        const content = fun.replace(/(^function\(content,arr\)\{|\}$)/g, '')
        return new Function('content', 'arr', content)
    }

    /**
     * 转换参数值系数
     * @param fun 代码文本
     * @param val 值
     * @returns 解析后的实际值
     */
    ParseCoefficient(fun: string, val: number) {
        if (Number(fun)) return Number(fun) * val as number
        else {
            const args = fun.replace(/(^\(|\)$)/g, '').split(',')
            const Fun = new Function(args[0], `return ${args[1]}`)
            return Fun(val) as number
        }
    }
    /**
     * 正则匹配经纬度
     * @param location 经纬地址 
     * @param reserver 是否翻转经纬
     */
    RegexLocation(location: string, reserver: boolean = false) {
        const str = reserver ? location.split(',').reverse().join(',') : location
        return /^-?1[0-8][0-9]\.[0-9]{6,7}\,-?[0-9]{2}\.[0-9]{6,7}$/.test(str)
    }
    /**
     * 正则匹配ip
     * @param ip 
     */
    RegexIP(ip: string) {
        return /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(ip)
    }
    /**
     * 正则匹配dtu通讯参数
     * @param uart 
     */
    RegexUart(uart: string) {
        return /^([0-9]{4}|[0-9]{5})\,[0-9]\,[0-9]\,.*/.test(uart)
    }
    /**
     * 正则匹配ICCID
     * @param ICCID 
     */
    RegexICCID(ICCID: string) {
        return /[0-9]{18,22}/.test(ICCID)
    }

    /**
     * 正则匹配手机号码
     * @param tel 
     */
    RegexTel(tel: string) {
        return /^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/.test(tel)
    }

    /**
     * 正则匹配邮箱账号
     * @param mail 
     */
    RegexMail(mail: string) {
        return /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/.test(mail)
    }
}