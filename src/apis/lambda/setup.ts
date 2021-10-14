import { useInject, useContext } from "@midwayjs/hooks"
import { Context } from "@midwayjs/koa"
import { cameraOption, Ec, videoOption } from "../interface"
import { Cache } from "../service/cache"
import { ecCtx } from "../service/ctx"
import { Nedb } from "../service/nedb"
import { ProtocolParse } from "../service/parse"
import { Sqlite } from "../service/sqlite"
import { Tool } from "../service/tool"
import { ioIn, ioOut } from "../../interface"

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
 * 获取所有绑定设备
 * @param uart
 * @returns 
 */
export const getBindDev = async (uart: Ec.uarts) => {
    const nedb = await useInject(Nedb)
    return await nedb.binddevices.findOne({ uart })
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
 * 获取指定协议
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

/**
 * 获取摄像头实时照片
 * @returns 
 */
export const getCarema = async (opt?: cameraOption) => {
    const ctx = await useInject(ecCtx)
    return await ctx.carema(opt).catch(e=>e)
}

/**
 * 获取最近的实时视频
 * @param opt 
 * @returns 
 */
export const getVideo = async (opt?: videoOption) => {
    const ctx = await useInject(ecCtx)
    return await ctx.video(opt)
}

/**
 * 设置io电平状态
 * @param key 
 * @param val 
 * @returns 
 */
export const setIoVal = async (key: ioOut, val: 0 | 1) => {
    const ctx = await useInject(ecCtx)
    const io = ctx.getIo(key)
    await io.write(val)
    setTimeout(async () => {
        ctx.WsServer.sendIosStat(await ctx.getIosStat())
    }, 100);
    return io.readSync()
}

/**
 * 获取Io配置
 * @param key 
 * @returns 
 */
export const getIoLabels = async (key?: ioOut | ioIn) => {
    const db = await useInject(Nedb)
    return await db.ios.find(key ? { name: key } : {})
}

/**
 * 修改io名称和配置
 * @param key 
 * @param label 
 * @param reverse 反转结果
 * @returns 
 */
export const setIoLabel = async (key: ioOut | ioIn, label: string, reverse: boolean) => {
    const db = await useInject(Nedb)
    await db.ios.update({ name: key }, { $set: { label, reverse } }, { upsert: true })
    const ctx = await useInject(ecCtx)
    const io = ctx.getIo(key)
    io.loadInfo(await db.ios.findOne({ name: key }))
    return "ok"
}

/**
 * 添加告警联动配置
 * @param alarm 
 */
export const addAlarmLinkage = async ({ key, condition, oprate }: Ec.alarmLinkage) => {
    const db = await useInject(Nedb)
    await db.alarmLinkage.update({ key }, { $set: { condition, oprate } }, { upsert: true })
    if (condition.name[0] === "DI") {
        const ctx = await useInject(ecCtx)
        await ctx.initIoAlarmLinkage()
    }
    return "ok"
}

/**
 * 删除告警联动配置
 * @param alarm 
 */
export const delAlarmLinkage = async (key: string) => {
    const db = await useInject(Nedb)
    const alarm = await db.alarmLinkage.findOne({ key })
    await db.alarmLinkage.remove({ key })
    if (alarm && alarm.condition.name[0] === "DI") {
        const ctx = await useInject(ecCtx)
        await ctx.initIoAlarmLinkage()
    }
    return "ok"
}

/**
 * 获取wifi列表
 * @returns 
 */
export const wifiScan = async () => {
    const ctx = await useInject(ecCtx)
    return await ctx.Wifi.getCurrentConnections()
}

/**
 * 连接到wifi
 * @param ssid 
 * @param password 
 * @returns 
 */
export const wifiConnect = async (ssid: string, password: string) => {
    const ctx = await useInject(ecCtx)
    return await ctx.Wifi.connect(ssid, password)
        .then(() => "ok")
        .catch(e => {
            console.log(e.message);
            return e
        })
}

/**
 * 删除wifi
 * @param ssid 
 * @returns 
 */
export const wifiDleteConnection = async (ssid: string) => {
    const ctx = await useInject(ecCtx)
    const result = await ctx.Wifi.deleteConnection(ssid)
        .then(() => "ok")
        .catch(async e => 'error')
    if (result === "ok") return result
    else {
        for (let i = 0; i < 100; i++) {
            const d = await ctx.Wifi.deleteConnection(`${ssid} ${i}`)
                .then(() => "ok")
                .catch(async e => 'error')
            if (d === "ok") return d
        }
    }
}

/**
 * 更新用户告警配置-显示参数
 * @param devId 设备id
 * @param ShowTag 
 * @returns 
 */
export const updateConstantShowTag = async (devId: string, ShowTag: string[]) => {
    const db = await useInject(Nedb)
    return await db.alarmsetups.update({ devId }, { $set: { ShowTag } }, { upsert: true })
}

/**
 * 更新用户告警配置-状态
 * @param devId 设备id
 * @param ShowTag 
 * @returns 
 */
export const updateConstantAlarmStatu = async (devId: string, AlarmStat: (Pick<Uart.ConstantAlarmStat, "alarmStat" | "name">)[]) => {
    const db = await useInject(Nedb)
    return await db.alarmsetups.update({ devId }, { $set: { AlarmStat } }, { upsert: true })
}

/**
 * 更新用户告警配置-阈值
 * @param devId 设备id
 * @param ShowTag 
 * @returns 
 */
export const updateConstantThreshold = async (devId: string, Threshold: Uart.Threshold[]) => {
    const db = await useInject(Nedb)
    return await db.alarmsetups.update({ devId }, { $set: { Threshold } }, { upsert: true })
}

/**
 * 获取指定设备告警配置
 * @param devId 
 * @returns 
 */
export const getUserConstant = async (devId: string) => {
    const db = await useInject(Nedb)
    return await db.alarmsetups.findOne({ devId })
}