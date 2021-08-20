import { Provide, Scope, ScopeEnum, Init, Inject, Config, App, Autoload } from "@midwayjs/decorator"
import { Tool } from "./tool"
import { Server } from "ws"
import { Application } from "@midwayjs/koa"
import { Server as Http } from "http"
import { wsMessege } from "../interface"



@Provide()
@Scope(ScopeEnum.Singleton)
@Autoload()
export class WsServer {

    @Inject('tool')
    Tool: Tool

    @App()
    app: Application

    @Config("socketConfig")
    config: Partial<any>

    ws: Server


    @Init()
    init() {
        const server = this.app.getApplicationContext().get<Http>("_midway_http_server")

        this.ws = new Server({ server, path: "/ws" })
        this.ws.on('connection', ws => {
            this.sendPiDevInfo()
        });
        console.log('ws start');

        setInterval(() => {
            this.sendPiDevInfo()
        }, 10000)

    }

    /**
     * 发送设备数据事件
     * @param data 任何格式的数据
     */
    sendDeviceData(data: any) {
        this.wsSend('DeviceData', data)
    }
    /**
     * 发送原始数据
     * @param buffer serialport接收的16进制数据 
     */
    sendDeviceOriginalData(buffer: string) {
        this.wsSend('originalData', buffer)
    }


    /**
     * 发送环控状态
     */
    async sendPiDevInfo() {
        this.wsSend('PiDevInfo', await this.Tool.osDevs())
    }

    /**
     * 统一下发消息
     * @param event 
     * @param data 
     */
    private wsSend = (event: string, data: any) => {
        const message: wsMessege = {
            event,
            data
        }
        this.ws.clients.forEach(ws => {
            ws.send(JSON.stringify(message))
        })
    }
}