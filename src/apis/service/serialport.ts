import serialport, { parsers } from "serialport"
import { Transform } from 'stream'
import { Ec } from "../interface"

// type events = 'unlock'

/** 公开serial端口类,封装serialport,不继承，避免方法污染 */
export class serial {
    /** stream流接收程序,根据字符或者超时来判断一次数据的完整性 */
    private parser: InterByteTimeoutParser | parsers.Delimiter
    private AMASet: Set<string>
    serialport: serialport
    private lock: boolean
    /** path为设备硬件地址，serialOptions为serialport类参数，setup为接收流的参数 */
    constructor(path: string, serialOptions: serialport.OpenOptions, setup: Ec.serialSetupDelimiter | Ec.serialSetupInterval = { isModbus: true, type: "interval", interval: 200 }) {
        const defaultopt: serialport.OpenOptions = {
            autoOpen: true,
            dataBits: 8,
            stopBits: 1,
            parity: 'none'
        }
        /** 初始化一个新的serialport */
        this.serialport = new serialport(path, Object.assign(defaultopt, serialOptions), err => {
            if (err) console.log(err);
            // else console.log('打开串行端口' + path);
        })
        // 根据setup类型,parse序列化可以是interval或limiter，interval适用于modbus Dtu协议，没有固定的结束符,limiter适用于232协议，有固定结束符,默认为interval
        this.parser = this.serialport.pipe("interval" in setup ? new InterByteTimeoutParser({ interval: setup.interval }) : new parsers.Delimiter({ delimiter: setup.delimiter }))
        // 监听serialport错误事件
        this.serialport
            .setMaxListeners(30)
            .on("error", (e: any) => {
                console.log("error", e);
            })
            .on('data', buffer => {
                this.serialport.emit('originalData', buffer)
            })
        // parse监听
        this.parser.on('data', (buffer: Buffer) => {
            this.serialport.emit('recvData', buffer)
        })
        //
        this.AMASet = new Set(['/dev/ttyAMA1', '/dev/ttyAMA0'])
        this.lock = false
    }
    /** 打开serialport端口,默认初始化打开 */
    open() {
        if (!this.serialport.isOpen) this.serialport.open()
    }
    /** 关闭serilport端口
     * 
     * cc
     */
    close() {
        if (this.serialport.isOpen) this.serialport.close()
    }
    /**
     * 更新serialport参数
     * @param options serialport配置对象
     */
    update(options: serialport.UpdateOptions) {
        return new Promise<Boolean>(resolve => {
            this.serialport.update(options, err => {
                if (err) {
                    console.log("update error:", err);
                    resolve(false)
                } else resolve(true)
            })
        })
    }
    /**
     * 写入serialport查询数据,返回查询结果
     * @param data 查询指令
     */
    write(data: Buffer) {
        // 根据指令获取设备地址
        // const pid = this.getPid(data)
        // 设置超时,超过10m没有响应reject超时
        return new Promise<Ec.uartReadData<string | Buffer>>((resolve) => {
            // 如果pid信道被占用则取消本次查询
            // if (this.PidBusyStat(pid)) resolve({ code: 2, instruct: data, data: 'pid is lock' })
            // 设置超时
            const timeout = setTimeout(() => {
                this.serialport.emit('recvData', { code: 0, data: 'timeOut' })
            }, 10000)
            // 监听数据响应事件
            this.serialport.once('recvData', (buffer: { code: number, data: string } | Buffer) => {
                // 设置设备地址free
                // this.setPidBusyStat(pid, false)
                // 清除超时
                clearTimeout(timeout)
                // console.timeEnd(data.toString())
                // 如果端口是ttyAMA1,返回结果会包含发送的数据，需要先清除
                if (Buffer.isBuffer(buffer)) {
                    // resolve(buffer)
                    resolve({ code: 200, timeStamp: Date.now(), instruct: data, data: this.AMASet.has(this.serialport.path) ? buffer.slice(data.length) : buffer })
                } else resolve({ ...buffer, instruct: data, timeStamp: Date.now() })
            })
            // 设置设备地址busy
            // this.setPidBusyStat(pid)
            this._writeBuffer(data).catch(err => {
                clearTimeout(timeout)
                this.serialport.emit('recvData', { code: 1, data: err })
            })
            // 写入查询数据,如果write流中还有数据则等待数据写入之后在操作
            /* if (this.serialport.writableLength > 0) {
                this.serialport.drain(() => {
                    this._writeBuffer(data).catch(err => {
                        clearTimeout(timeout)
                        this.serialport.emit('recvData', { code: 1, data: err })
                    })
                })
            } else {
                this._writeBuffer(data).catch(err => {
                    clearTimeout(timeout)
                    this.serialport.emit('recvData', { code: 1, data: err })
                })
            } */
            /* this.serialport.write(data, err => {
                if (err) {
                    clearTimeout(timeout)
                    this.serialport.emit('recv' + pid, { code: 1, data: err })
                }
            }) */
        })
    }

    /**
     * 写入buffer
     * @param buffer 
     */
    private _writeBuffer(buffer: Buffer | string) {
        return new Promise<void>((resolve, reject) => {
            this.serialport.write(buffer, err => {
                if (err) {
                    console.log(err);
                    reject(err)
                }
                else resolve
            })
        })
    }

    /**
     * 修改锁状态
     * @param stat  
     */
    setlock(stat: boolean = true) {
        if (!stat) this.serialport.emit('unlock')
        this.lock = stat
    }

    /**
     * 等待lock释放
     * @param afterlock 解锁之后设置锁的状态,默认上锁
     */
    async awaitUnlock(afterlock: boolean = true) {
        await new Promise<void>(resolve => {
            if (this.lock) this.serialport.once('unlock', _ => resolve())
            else resolve()
        })
        this.setlock(afterlock)
        return this.lock
    }


    // 监听pid释放事件
    /* onPidfree(pid: number, listener: () => void) {
        this.serialport.once('pidfree' + pid, listener)
    } */

    // 获取设备繁忙状态
    /* PidBusyStat(pid: number) {
        return this.busy.get(pid) || false
        
    } */

    // 设置pid查询状态
    /* private setPidBusyStat(pid: number, stat: boolean = true) {
        // console.log(pid, stat ? 'busy' : 'free');
        if (!stat) this.serialport.emit('pidfree' + pid)
        this.busy.set(pid, stat)
    } */

    // 获取pid
    /* private getPid(data: Buffer | string) {
        if (!this.opt.isModbus || typeof data === 'string') {
            return 0
        } else {
            return data.readInt8()
        }
    } */
}

/**
 * 序列化接收stream，当接收流间隔为指定值内为连续字符内容
 */
class InterByteTimeoutParser extends Transform {
    maxBufferSize: number
    currentPacket: number[]
    interval: number
    intervalID!: NodeJS.Timeout
    constructor(options: { interval: number; maxBufferSize?: number }) {
        super()
        options = { maxBufferSize: 65536, ...options }

        this.maxBufferSize = options.maxBufferSize!
        this.currentPacket = []
        this.interval = options.interval
    }
    _transform(chunk: number[], encoding: string, cb: CallableFunction) {
        clearTimeout(this.intervalID)
        for (let offset = 0; offset < chunk.length; offset++) {
            this.currentPacket.push(chunk[offset])
            if (this.currentPacket.length >= this.maxBufferSize) {
                this.emitPacket()
            }
        }
        this.intervalID = setTimeout(this.emitPacket.bind(this), this.interval)
        cb()
    }
    emitPacket() {
        clearTimeout(this.intervalID)
        if (this.currentPacket.length > 0) {
            this.push(Buffer.from(this.currentPacket))
        }
        this.currentPacket = []
    }
    _flush(cb: CallableFunction) {
        this.emitPacket()
        cb()
    }
}