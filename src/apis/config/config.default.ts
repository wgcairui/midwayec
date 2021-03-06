import { AxiosRequestConfig } from "axios"
import { ServerOptions } from "socket.io"
import { serverConfig } from "../interface"

/**
 * 服务器配置
 */
export const server: serverConfig = {
    /** 云平台服务器地址 */
    serverUrl: "https://uart.ladishb.com",
    /** 服务器树莓派默认串口列表对象 */
    uart: {
        AMA0: "/dev/ttyAMA0",
        AMA1: "/dev/ttyAMA1",
        AMA2: "/dev/ttyAMA2",
        AMA3: "/dev/ttyAMA3",
        AMA4: "/dev/ttyAMA4"
    },
    /** 服务器树莓派默认io端 */
    io: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
    /**
     * sql数据库-查询结果每隔n次保存
     */
    resultSaveInterNum: 10
}

/**
 * axios配置
 */
export const axios: AxiosRequestConfig = {
    baseURL: "https://uart.ladishb.com"
}

/**
 * socket配置
 */
export const socketConfig: Partial<ServerOptions> = {
    path: "/client",
    cors: {
        origin: "http://192.168.1.81:7002",
        methods: ['GET', 'POST']
    }
}
