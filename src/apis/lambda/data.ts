
import { useInject, useContext } from "@midwayjs/hooks"
import { Nedb } from "../service/nedb"
import { CascaderOption } from "element-plus/lib/el-cascader-panel";

/**
 * 获取读取设备参数,构成
 */
export const getAlarmLinkageConditionsOpts = async () => {
    const db = await useInject(Nedb)
    const devs = await db.binddevices.find({})
    const Opts = devs.map<Promise<CascaderOption>>(async dev => {
        const mountDev = dev.model
        const protocols = await db.protocols.findOne({ Protocol: dev.protocol })
        const value = mountDev + dev.pid.toString().padStart(3, '0')
        return {
            label: value,
            value,
            children: protocols.instruct.map(el => el.formResize.map(el2 => el2.name)).flat().map(name => ({ label: name, value: name }))
        }
    })
    const DevsOpts = await Promise.all(Opts)
    const Ios = await db.ios.find({})
    const Dis = Ios.filter(el => el.label && /^i/.test(el.name)).map<CascaderOption>(({ name, label }) => ({ label, value: name }))

    return [
        ...DevsOpts,
        {
            label: "DI",
            value: "DI",
            children: Dis
        }
    ]
}

/**
 * 获取读取设备参数,构成
 */
export const getAlarmLinkageOprates = async () => {
    const db = await useInject(Nedb)
    const Ios = await db.ios.find({})
    const Dis = Ios.filter(el => el.label && /^o/.test(el.name)).map<CascaderOption>(({ name, label }) => ({ label, value: name }))
    return Dis
}

/**
 * 获取告警联动列表
 */
export const getAlarmLinkages = async () => {
    const db = await useInject(Nedb)
    return await db.alarmLinkage.find({})
}