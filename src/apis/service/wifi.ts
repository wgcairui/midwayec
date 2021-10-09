import * as nodeWifi from "node-wifi"
import { Provide, Init } from "@midwayjs/decorator"


@Provide()
export class Wifi {

    @Init()
    init() {
        nodeWifi.init({ iface: null })
    }

    scan() {
        return new Promise<nodeWifi.networks[]>((resolve, reject) => {
            nodeWifi.scan((err, nets) => {
                if (err) reject(err)
                else resolve(nets)
            })
        })
    }

    connect(ssid: string, password: string) {
        return new Promise<void>((resolve, reject) => {
            nodeWifi.connect({ ssid, password }, err => {
                if (err) reject(err)
                else resolve()
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
                else resolve(cus)
            })
        })
    }

}