import { Provide, Scope, ScopeEnum, Init, Inject, Autoload, Config } from "@midwayjs/decorator"
import { list } from "serialport"
import exec from "child_process"
import fs from "fs"
import { Tool } from "./tool"
import { Nedb } from './nedb'
import { Cache } from "./cache"
import { serial } from "./serialport"
import { ProtocolParse } from "./parse"
import { Sqlite } from "./sqlite"
import { cameraOption, caremavidResult, Ec, serverConfig, videoOption } from "../interface"
import { Api } from "./api"
import { WsServer } from "./ws"
import { join } from "path"


/** server集中总线,挂载后台需要的数据库,工具,缓存,socket */
@Provide()
@Scope(ScopeEnum.Singleton)
@Autoload()
export class ecCtx {

    @Inject()
    Cache: Cache

    @Inject()
    Nedb: Nedb

    @Inject()
    Tool: Tool

    @Inject()
    ProtocolParse: ProtocolParse

    @Inject()
    Sqlite: Sqlite

    @Inject()
    Api: Api

    @Inject()
    WsServer: WsServer

    @Config("server")
    serverConfig: serverConfig


    /** 所有uart串口对象缓存 */
    serials: Map<Ec.uarts, serial>
    /** 调试模式 */
    private consoleMode: boolean

    /**
     * 记录定时查询数据的配置
     */
    serialTimeout: any[]

    /**
     * 记录查询结果保存间隔,用于选择性保存查询结果
     */
    private resultSaveInterNMap: Map<string, number>

    @Init()
    async init() {
        this.consoleMode = false
        this.serials = new Map()
        this.serialTimeout = []
        this.resultSaveInterNMap = new Map()
        this.Cache.start().then(async () => {
            await this.openSerialport()
            await this.startSerial()
        })
    }

    /** 根据串口配置打开所有串口 */
    async openSerialport(serialport?: Ec.uarts) {
        const bindserials = await this.Nedb.bindserials.find(serialport ? { serialport } : {})
        bindserials.forEach(async uart => {
            // 如果串口已经打开,先关闭在打开
            if (this.serials.has(uart.serialport)) {
                const serial = this.serials.get(uart.serialport)!
                await serial.awaitUnlock()
                serial.close()
            }
            const { serialport, autoOpen, baudRate, dataBits, stopBits, parity } = uart
            this.serials.set(serialport, new serial(serialport, { autoOpen, baudRate, dataBits, stopBits, parity }, { type: 'interval', isModbus: true, interval: 100 }))
        })
        return this.serials
    }

    /** 启动串口设备,查询数据 */
    async startSerial() {
        // 关闭所有定时查询
        this.serialTimeout.forEach(el => {
            clearTimeout(el)
        })
        //
        const bindDevs = await this.Nedb.binddevices.find({})
        // console.log({ bindDevs, serials: this.serialTimeout });
        // 开始查询所有设备指令
        bindDevs.forEach(dev => {
            this.startSerialQuery(dev, this.serials.get(dev.uart)!, this.Cache.CacheProtocol.get(dev.protocol)!)
        })
    }

    /** 启动串口查询流程 */
    private async startSerialQuery(dev: Ec.Mountdev, serial: serial, protocol: Uart.protocol) {
        const { Type, instruct } = protocol
        //console.log(`start query ${dev.pid} at ${dev.uart}`);
        // 如果serial是lock状态,等待unlock解锁再执行查询
        await serial.awaitUnlock()
        //console.log(`end query ${dev.pid} at ${dev.uart}`);
        // 迭代所有指令,串行执行查询,并行执行会出现数据在stream中连续的,而且返回的次序和发送的次序不保证一致,数据完整性不保证,
        // 需要迭代每个字节判断数据长度和数据校验,遭遇非标协议不好处理,逻辑会很复杂,优点是效率为串行的n2
        const results: Required<Ec.uartReadData>[] = []
        for (let el of instruct) {
            const instructString = Type === 232 ? el.name + "\r" : this.Tool.Crc16modbus(dev.pid, el.name)
            const result = await new Promise<Required<Ec.uartReadData<string | Buffer>>>(resolve => {
                serial.write(Buffer.from(instructString, Type === 232 ? 'utf-8' : 'hex')).then(data => {
                    resolve({ ...data, name: el.name, instructString, result: [] })
                })
            })
            if (result.code === 200) results.push(result as Required<Ec.uartReadData>)
            else console.log({ result });

        }
        /* if(dev.protocol === 'P01'){
            console.log(results.map(el => ({ [el.name]: el.data.toString(),i:el.instruct })));

        } */
        // 给serial解锁
        serial.setlock(false)
        this.ProtocolParse.parse(results, dev.protocol).then(async el => {
            //console.log(el);
            if (el.length > 0) {
                this.Nedb.resultSingles.update({ uart: dev.uart, pid: dev.pid }, { $set: { data: el } }, { upsert: true })
                this.WsServer.sendDeviceData({ ...dev, data: el })

                /**
                 * 每过this.serverConfig.resultSaveInterNum次保存查询结果
                 */
                const n = this.resultSaveInterNMap.get(dev._id)
                if (n && Number.isInteger(n / this.serverConfig.resultSaveInterNum)) {
                    this.Sqlite.insert(dev._id!, Date.now(), el.filter(els => els.value))
                }
                this.resultSaveInterNMap.set(dev._id, (n || 0) + 1)

            }
        })
        // 间隔查询时间
        const n = setTimeout(() => {
            // 如果是调试模式则取消继续轮询
            if (this.consoleMode) return
            this.startSerialQuery(dev, serial, protocol)
        }, 1000)
        const uartN = dev.uart[dev.uart.length - 1]
        this.serialTimeout[parseInt(uartN)] = n
    }

    /** 联网初始化基础配置数据 */
    async initDB() {
        console.log('正在初始化数据库')
        console.log('清理协议，设备，协议配置数据');
        await this.Nedb.protocols.remove({}, { multi: true })
        await this.Nedb.constants.remove({}, { multi: true })
        await this.Nedb.devTypes.remove({}, { multi: true })
        console.log('下载云端协议数据');
        const { code, data } = await this.Api.syncSetup()
        console.log('存储云端数据到本地');
        this.Nedb.protocols.insert(data.protocol).then(el => {
            console.log('已保存协议数据', el.length);
        }).catch(e => {
            console.log('协议数据写入失败');
        })
        this.Nedb.devTypes.insert(data.device).then(el => {
            console.log('以保存型号数据', el.length);
        }).catch(e => {
            console.log('型号数据写入失败');
        })
        this.Nedb.constants.insert(data.constant).then(el => {
            console.log('以保存默认配置', el.length);
        }).catch(e => {
            console.log('默认配置写入失败');
        })
    }

    /** 获取uart串口列表 */
    async uart_list() {
        const el = await list()
        return el.map(uart => uart.path)
    }

    /** 获取调试模式状态 */
    getConsoleMode() {
        return this.consoleMode
    }

    /** 设置开关调试模式 */
    async setConsoleMode(uart: Ec.uarts, stat: boolean) {
        if (this.consoleMode !== stat) return this.consoleMode
        const serial = this.serials.get(uart)!
        if (serial) {
            if (this.consoleMode) {
                console.log('close consoleMode...');
                this.consoleMode = false
                serial.serialport.removeListener('originalData', () => {
                    console.log('remove serialport listener <originalData>');
                })
                await this.startSerial()
            } else {
                console.log('start consoleMode...');

                this.consoleMode = true
                const serials = [...this.serials.values()]
                // 等待所有串口端口锁定空闲
                await Promise.all(serials.map(el => el.awaitUnlock(false)))
                // 注册监听事件
                this.WsServer.sendDeviceOriginalData('start consoleMode...')
                serial.serialport.on('originalData', (buffer: Buffer) => {
                    this.WsServer.sendDeviceOriginalData(buffer.toString('hex'))
                })
            }
        }
        return this.consoleMode
    }

    /** 拍照,生成jpeg图像,压缩率10 */
    carema(opt?: cameraOption) {
        const opts: Required<cameraOption> = {
            name: Date.now().toString(),
            zip: true,
            zipRatio: 10,
            timeout: 3
        }
        const assign = Object.assign(opts, opt || {})
        return new Promise<caremavidResult>((resolve, reject) => {
            const path = `/public/${assign.name}.jpeg`
            const cmd = `raspistill -e jpg -q ${assign.zip ? (assign.zipRatio || 10) : 100} -t ${assign.timeout}000 -o ${join(process.cwd(), path)}`
            exec.exec(cmd, (err, out) => {
                if (err) reject(err)
                else resolve({
                    timeStamp: Date.now(),
                    name: assign.name,
                    path,
                    out
                })
            })
        })
    }

    /** 摄像,生成h264视频,转换为mp4 */
    video(opt?: videoOption) {
        const opts: Required<videoOption> = {
            name: Date.now().toString(),
            timelong: 10
        }
        // 
        const assign = Object.assign(opts, opt || {})
        if (assign.timelong < 1 || assign.timelong > 60) assign.timelong = 60
        return new Promise((resolve, reject) => {
            const path = join(process.cwd(), "/public", `/${assign.name}.h264`)
            const cmd = `raspivid -o ${path} -t ${assign.timelong}000`
            exec.exec(cmd, (err, out) => {
                if (err) reject(err)
                const newPath = path.replace(/h264$/, 'mp4')
                exec.exec(`MP4Box -add ${path} ${newPath}`, (e1, o1) => {
                    if (e1) reject(e1)
                    else {
                        fs.rm(path, e2 => {
                            if (e2) reject(e2)
                            else resolve({
                                timeStamp: Date.now(),
                                name: assign.name,
                                path: "/public" + newPath.split('public')[1],
                                out: o1
                            })
                        })
                    }
                })
            })
        })
    }
}
