import * as nodeWifi from "node-wifi"
import { Provide, Init } from "@midwayjs/decorator"


@Provide()
export class Wifi {

    @Init()
    init() {
        nodeWifi.init({ iface: "wlan0" })
    }

    scan() {
        return new Promise<nodeWifi.networks[]>((resolve, reject) => {
            nodeWifi.scan((err, nets) => {
                if (err) reject(err)
                else resolve(nets.filter(el=>el.ssid))
            })
        })
    }

    connect(ssid: string, password: string) {
        return new Promise<string>((resolve, reject) => {
            nodeWifi.connect({ ssid, password }, err => {
                if (err) {
                    console.log({err});
                    reject(err)
                }
                else resolve("ok")
            })
        })
    }

    disconnect() {
        return new Promise<void>((resolve, reject) => {
            nodeWifi.disconnect(err => {
                if (err) reject(err)
                else resolve()
            })
        })
    }

    deleteConnection(ssid: string) {
        return new Promise<void>((resolve, reject) => {
            nodeWifi.deleteConnection({ ssid }, err => {
                if (err) reject(err)
                else resolve()
            })
        })
    }

    getCurrentConnections() {
        return new Promise<nodeWifi.networks[]>((resolve, reject) => {
            nodeWifi.getCurrentConnections((err, cus) => {
                if (err) reject(err)
                else resolve(cus.filter(el=>el.ssid))
            })
        })
    }

}