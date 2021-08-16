import { Provide, Inject } from "@midwayjs/decorator"
import { HttpService } from "@midwayjs/axios"


interface syncData {
    protocol: Uart.protocol[],
    device: Uart.DevsType[],
    constant: Uart.ProtocolConstantThreshold[]
}

interface result<T> {
    code: number,
    data: T
}

@Provide()
export class Api {

    @Inject()
    HttpService: HttpService


    /**
     * 请求云平台下发基础配置
     * @returns 云平台基础配置
     */
    async syncSetup() {
        const resopon = await this.HttpService.post<result<syncData>>('/api/ec/syncSetup', { mac: "ec123456789" })
        return resopon.data
    }
}