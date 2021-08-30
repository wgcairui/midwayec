import { MessageBoxInputData } from "element-plus/lib/el-message-box/src/message-box.type";
import { OpenOptions } from "serialport";

type uart = "AMA0" | "AMA1" | "AMA2" | "AMA3" | "AMA4"
type io = 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27

export interface serverConfig {
    /** 云平台服务器地址 */
    serverUrl: string
    /** 服务器树莓派默认串口列表对象 */
    uart: Record<uart, Ec.uarts>
    /** 服务器树莓派默认io端 */
    io: io[]
    /**
     * sql数据库-查询结果每隔n次保存
     */
    resultSaveInterNum: number
}

export interface cameraOption {
    name?: string,
    zip?: boolean,
    zipRatio?: number
    timeout?: number
}

export interface videoOption {
    name?: string
    timelong?: number
}

export interface caremavidResult {
    timeStamp: number
    name: string
    path: string
    out: string
}


export declare namespace Ec {
    type uarts = "/dev/ttyAMA0" | "/dev/ttyAMA1" | "/dev/ttyAMA2" | "/dev/ttyAMA3" | "/dev/ttyAMA4"
    type dis = 16 | 17 | 18 | 19 | 20 | 21
    type dos = 22 | 23 | 24 | 25 | 26 | 27

    type pickSerialOptions = Pick<OpenOptions, 'autoOpen' | 'baudRate' | 'dataBits' | 'stopBits' | 'parity'>
    interface serialSetupInterval {
        isModbus: Boolean
        type: 'interval',
        interval: number
    }
    // 
    interface serialSetupDelimiter {
        isModbus: Boolean
        type: 'Delimiter',
        delimiter: string | Buffer | number[] // 分隔符
    }

    // 串口返回数据
    interface uartReadData<T extends string | Buffer = Buffer> {
        code: number,
        name?: string,
        instructString?: string,
        instruct: Buffer,
        data: T,
        timeStamp: number
    }

    // 串口配置
    interface uartSetup extends pickSerialOptions {
        parse: serialSetupInterval | serialSetupDelimiter
    }
    interface BindSerial extends Required<pickSerialOptions> {
        serialport: uarts
    }

    // 挂载设备
    interface Mountdev {
        type: string
        model: string
        pid: number
        protocol: string
        alias: string
        uart: uarts
        _id?: string
    }

    interface MountIo {

    }

    type DeviceData = Ec.Mountdev & { data: Uart.queryResultArgument[] }
    /**
     * v-chart图表组件数据格式约束
     * @param columns 显示的单元
     * @param rows 
     */
    interface chartData {
        columns: string[],
        rows: { [x in string]: any }[]
    }

    interface consoleInstruct {
        serial: Ec.uarts,
        type: Uart.protocolType,
        protocol: string,
        address: number,
        instruct: string,
        custom: boolean
    }

    // El table row
    interface EltableRow<T = any> {
        $index: number
        row: T
    }
    type ElMessageBoxInputData = MessageBoxInputData
    type ElMessageBoxCloseAction = MessageBoxInputData["action"]

    // 串口返回数据
    interface uartReadData<T extends string | Buffer = Buffer> {
        code: number,
        name?: string,
        instructString?: string,
        instruct: Buffer,
        data: T,
        timeStamp: number
        result?: Uart.queryResultArgument[]
    }

    /**
     * pi设备返回的状态
     * 
     */
    interface PiDevInfo {
        disk: {
            available: number
            size: number
            use: number
            used: number
        }
        getway: string
        men: {
            free: number
            total: number
            used: number
        }
        net: {
            ip4: string
            ip4subnet: string
            ip6: string
            ip6subnet: string
            mac: string
        }
    }

    /**
     * 单例数据格式
     */
    type SingleData = Mountdev & { data: Uart.queryResultArgument[], _id?: string }
}

export interface wsMessege<T = any> {
    event: string,
    data: T
}
