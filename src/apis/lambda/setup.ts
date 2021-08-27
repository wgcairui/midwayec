import { useInject, useContext } from "@midwayjs/hooks"
import { Context } from "@midwayjs/koa"
import { Ec } from "../interface"
import { Cache } from "../service/cache"
import { ecCtx } from "../service/ctx"
import { Nedb } from "../service/nedb"
import { ProtocolParse } from "../service/parse"
import { Sqlite } from "../service/sqlite"
import { Tool } from "../service/tool"

/**
 * 获取所有串口列表
 * @returns 
 */
export const getSerialportlist = async () => {
    return (await useInject(ecCtx)).uart_list()
}

/**
 * 添加新的串口设备
 * @param setup 
 * @returns 
 */
export const addSerialport = async (setup: Ec.BindSerial) => {
    const nedb = await useInject(Nedb)
    const up = await nedb.bindserials.update({ serialport: setup.serialport }, setup, { upsert: true })
    await (await useInject(ecCtx)).openSerialport(setup.serialport)
    return up
}

/**
 * 获取配置串口设备列表
 */
export const getBindSerials = async () => {
    const nedb = await useInject(Nedb)
    return await nedb.bindserials.find({})
}

/**
 * 获取所有设备型号
 * @returns 
 */
export const getDevices = async () => {
    const nedb = await useInject(Nedb)
    return await nedb.devTypes.find({})
}

/**
 * 获取所有绑定设备
 * @returns 
 */
export const getBindDevs = async () => {
    const nedb = await useInject(Nedb)
    return await nedb.binddevices.find({})
}

/**
 * 添加绑定设备
 */
export const addMountdev = async ({ uart, type, model, pid, protocol, alias }: Ec.Mountdev) => {
    const nedb = await useInject(Nedb)
    const result = await nedb.binddevices.insert({ uart, type, model, pid, protocol, alias })
    const ctx = await useInject(ecCtx)
    ctx.startSerial()
    return result
}

/**
 * 删除绑定设备
 * @param id 
 * @returns 
 */
export const delMountdev = async (id: string) => {
    const nedb = await useInject(Nedb)
    const result = await nedb.binddevices.remove({ "_id": id })
    const ctx = await useInject(ecCtx)
    ctx.startSerial()
    return result
}

/**
 * 获取所有协议
 * @param _id 
 * @returns 
 */
export const getProtocols = async (_id?: string) => {
    const nedb = await useInject(Nedb)
    return _id ? await nedb.protocols.findOne({ _id }) : await nedb.protocols.find({})
}

/**
 * 获取所有协议
 * @param _id 
 * @returns 
 */
export const getProtocol = async (Protocol: string) => {
    const nedb = await useInject(Nedb)
    return await nedb.protocols.findOne({ Protocol })
}


/**
 * 获取所有协议
 * @param _id 
 * @returns 
 */
export const getProtocolSetups = async () => {
    const nedb = await useInject(Nedb)
    return await nedb.constants.find({})
}

/**
 * 获取所有协议
 * @param _id 
 * @returns 
 */
export const getProtocolSetup = async (Protocol: string) => {
    const nedb = await useInject(Nedb)
    return await nedb.constants.findOne({ Protocol })
}



/**
 * 获取调试状态
 */
export const getConsoleMode = async () => {
    const ctx = await useInject(ecCtx)
    return ctx.getConsoleMode()
}

/**
 * 开关调试模式
 * @param opt 
 * @returns 
 */
export const setConsoleMode = async (uart: Ec.uarts, stat: boolean) => {
    const ctx = await useInject(ecCtx)
    return await ctx.setConsoleMode(uart, stat)
}

/**
 * 发送调试指令
 * @param opt 
 */
export const sendConsoleInstruct = async (opt: Ec.consoleInstruct) => {
    const ctx = await useInject(ecCtx)
    const cache = await useInject(Cache)

    const serial = ctx.serials.get(opt.serial)!
    const protocol = cache.CacheProtocol.get(opt.protocol)!
    if (opt.custom) {
        const type = protocol.Type === 232 ? 'utf-8' : 'hex'
        const data = await serial.write(Buffer.from(opt.instruct + (protocol.Type === 232 ? '\r' : ''), type))
        if (data.code === 200) {
            data.data = data.data.toString(type)
        }
        return data
    } else {
        const parse = await useInject(ProtocolParse)
        const tool = await useInject(Tool)
        // 如果是232直接发送数据
        if (protocol.Type === 232) {
            const data = await serial.write(Buffer.from(opt.instruct + '\r', 'utf-8')) as Required<Ec.uartReadData>
            // 如果code等于200,解析数据后合并结果返回
            console.log({ data, opt });

            if (data.code === 200) {
                data.name = opt.instruct
                const result = parse.parse([data], opt.protocol)
                return Object.assign(data, { data: data.data.toString('utf-8'), result })
            } else return data
        } else {
            // 获取指令信息
            const instruct = protocol.instruct.find(el => el.name === opt.instruct)!
            const datas: Required<Ec.uartReadData>[] = []
            // 如果是非标指令则根据前处理脚本编辑指令查询
            if (instruct.noStandard) {

            } else {
                const ins = tool.Crc16modbus(opt.address, opt.instruct)
                const data = await serial.write(Buffer.from(ins, 'hex')) as Required<Ec.uartReadData>
                // data对象添加指令name和合成的instruct
                data.name = opt.instruct
                data.instructString = ins
                datas.push(data)
            }
            // 如果正常接收到数据就开始解析
            if (datas[0].code === 200) {
                const data = datas[0]
                const dataStr = data.data.toString('hex')
                const result = await parse.parse(datas, opt.protocol)
                return {
                    code: data.code,
                    name: data.name,
                    instructString: data.instructString,
                    data: dataStr,
                    timeStamp: data.timeStamp,
                    result
                }

            } else return datas[0]
        }
    }
}

/**
 * 获取数据库设备历史数据表
 */
export const deviceHistoryCount = async () => {
    const sqlite = await useInject(Sqlite)
    return await sqlite.count()
}

/**
 * 备份数据库
 */
export const backData = async (name: string) => {
    const ctx = useContext<Context>()
    const sqlite = await useInject(Sqlite)
    console.log('备份开始');
    const info = await sqlite.backup(name)!
    console.log('备份完成');
    if (info) {
        ctx.attachment(info.name)
        return info.stream
    }
}

/**
 * 删除设备历史数据
 * @param id 
 * @returns 
 */
export const deleteColumns = async (id?: string) => {
    const sqlite = await useInject(Sqlite)
    return id ? sqlite.delete(id) : sqlite.inits()
}

/**
 * 获取system系统信息
 */
export const PiSysInfo = async () => {
    const tool = await useInject(Tool)
    return await tool.os()
}

/**
 * 获取system设备信息
 * @returns 
 */
export const PiDevInfo = async () => {
    const tool = await useInject(Tool)
    return await tool.osDevs()
}

/**
 * 联网初始化基础配置数据
 * @returns 
 */
export const initSetup = async () => {
    const ctx = await useInject(ecCtx)
    return await ctx.initDB()
}