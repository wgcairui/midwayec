import { Provide } from "@midwayjs/decorator"
import { BinaryValue, Direction, Gpio, Options } from "onoff"

type gpioNumer = 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27

/** Gpio控制类,监听和开关io设备 */
@Provide()
export class IOs {
    getIo(gpio: gpioNumer, direction: Direction, edge: "none" | "rising" | "falling" | "both" = "none", options: Options = {}) {
        return new IO(gpio, direction, edge, options)
    }
}




class IO extends Gpio {

    constructor(gpio: gpioNumer, direction: Direction, edge: "none" | "rising" | "falling" | "both" = "none", options: Options = {}) {
        // 如果为di则开启监听模式
        if (direction === 'in') edge = 'both'
        super(gpio, direction, edge, options)
        process.on('SIGINT', () => {
            this.unexport()
        })
    }
    // 不能转换为Promise,Promise获得第一次结果后就会销毁函数
    /* watch() {
        return new Promise<BinaryValue>((resolve, reject) => {
            super.watch((err, val) => {
                console.log('');
                if (err) reject(err)
                else resolve(val)
            })
        })
    } */
    /** 读取io设备状态 */
    read() {
        return new Promise<BinaryValue>((resolve, reject) => {
            super.read((err, val) => {
                if (err) reject(err)
                else resolve(val)
            })
        })
    }
    /** 解除对io设备的监听 */
    unwatch() {
        return new Promise<BinaryValue>((resolve, reject) => {
            super.unwatch((err, val) => {
                if (err) reject(err)
                else resolve(val)
            })
        })
    }
    /** 修改io设备状态 */
    write(value: BinaryValue) {
        return new Promise<void>((resolve, reject) => {
            super.write(value, (err) => {
                if (err) reject(err)
            })
        })
    }
}