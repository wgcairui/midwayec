import { Provide, Scope, ScopeEnum, Init, Inject } from "@midwayjs/decorator"
import { Nedb } from "./nedb"
/* 
数据执行器部分，更新协议，设备类型，终端，节点的缓存数据，发送终端查询指令指令
*/

@Provide()
@Scope(ScopeEnum.Singleton)
export class Cache {

    @Inject()
    Nedb: Nedb

    /** 协议缓存protocol */
    CacheProtocol: Map<string, Uart.protocol>;
    /** 设备类型缓存devmodal=> */
    CacheDevsType: Map<string, Uart.DevsType>;
    /** 缓存协议的常量设置,protocol=>Constant */
    CacheConstant: Map<string, Uart.ProtocolConstantThreshold>

    CacheUnit: Map<string, string>

    @Init()
    init() {
        this.CacheProtocol = new Map();
        this.CacheDevsType = new Map();
        this.CacheConstant = new Map()
        this.CacheUnit = new Map()
    }
    /** 更新所有缓存信息 */
    async start(): Promise<void> {
        await this.RefreshCacheDevType();
        await this.RefreshCacheProtocol();
        await this.RefreshCacheConstant();
    }
    // 
    async RefreshCacheProtocol(protocol?: string) {
        const res = await this.Nedb.protocols.find(protocol ? { Protocol: protocol } : {})
        console.log(`更新协议缓存......`, res.length);
        res.map(el => {
            el.instruct = el.instruct.filter(el1 => el1.isUse)
            return el
        }).forEach(el => {
            this.CacheProtocol.set(el.Protocol, el)
            //this.ctx.event.emit("updateProtocol", el.Protocol)
        })
        if (res.length === 0 && protocol) {
            this.CacheProtocol.delete(protocol)
        }
        return this
    }
    //
    async RefreshCacheDevType(DevModel?: string) {
        const res = await this.Nedb.devTypes.find(DevModel ? { DevModel } : {})
        console.log(`更新设备型号缓存......`, res.length);
        res.forEach(el => {
            this.CacheDevsType.set(el.DevModel, el)
        })
        return this
    }

    //
    async RefreshCacheConstant(protocol?: string) {
        const res = await this.Nedb.constants.find(protocol ? { Protocol: protocol } : {})
        console.log(`更新协议常量缓存......`, res.length);
        res.forEach(el => {
            this.CacheConstant.set(el.Protocol, el)
            //this.ctx.event.emit("updateSysSetup", el.Protocol)
        })
        if (res.length === 0 && protocol) {
            this.CacheConstant.delete(protocol)
        }
        return this
    }

    /**
    * 
    * @param unit 协议参数单位
    * @val 值
    */
    parseUnit(unit: string, val: string) {
        const hash = "Unit_" + unit + val
        if (!this.CacheUnit.has(hash)) {
            const arr = unit
                .replace(/(\{|\}| )/g, "")
                .split(",")
                .map(el => el.split(":"))
            //.map(el => ({ [el[0]]: el[1] }));
            for (const [key, v] of arr) {
                this.CacheUnit.set("Unit_" + unit + key, v)
            }
        }
        return this.CacheUnit.get(hash)
    }
}
