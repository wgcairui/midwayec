import { Provide, Scope, ScopeEnum, Init } from "@midwayjs/decorator"
import nedb from "nedb"
import { join } from "path"
import { Ec } from "../interface"

@Provide()
@Scope(ScopeEnum.Singleton)
export class Nedb {
    /** 用户信息 */
    users: nedbPromise<Uart.UserInfo>
    /** 绑定设备 */
    binddevices: nedbPromise<Ec.Mountdev>
    /** 布局信息 */
    layouts: nedbPromise
    /** 告警配置 */
    alarmsetups: nedbPromise
    /** 聚合设备配置 */
    aggregations: nedbPromise
    /** 协议信息 */
    protocols: nedbPromise<Uart.protocol>
    /** 设备阈值配置 */
    constants: nedbPromise<Uart.ProtocolConstantThreshold>
    /** 设备最新运行数据 */
    resultSingles: nedbPromise
    /** 设备型号信息 */
    devTypes: nedbPromise<Uart.DevsType>
    /** 树莓派串口信息 */
    bindserials: nedbPromise<Ec.BindSerial>
    /**
     * 
     * @param path 数据库存放地址
     */
    @Init()
    init(path: string = join(__dirname, "../db")) {
        this.users = new nedbPromise({ filename: path + '/user.json', autoload: true })
        this.bindserials = new nedbPromise({ filename: path + "/bindserials.json", autoload: true })
        this.binddevices = new nedbPromise({ filename: path + '/binddevices.json', autoload: true })
        this.layouts = new nedbPromise({ filename: path + '/layouts.json', autoload: true })
        this.alarmsetups = new nedbPromise({ filename: path + '/alarmsetups.json', autoload: true })
        this.aggregations = new nedbPromise({ filename: path + '/aggregations.json', autoload: true })
        this.protocols = new nedbPromise({ filename: path + '/protocols.json', autoload: true })
        this.constants = new nedbPromise({ filename: path + '/constants.json', autoload: true })
        this.resultSingles = new nedbPromise({ filename: path + '/resultSingles.json', autoload: true })
        this.devTypes = new nedbPromise({ filename: path + '/devTypes.json', autoload: true })

    }
}


/**
 * nedb数据库是回调形式的,这里转换为promise
 */
class nedbPromise<T = any> {
    db: nedb<any>
    /**
     * 
     * @param pathOrOptions nedb配置
     */
    constructor(pathOrOptions?: string | nedb.DataStoreOptions) {
        this.db = new nedb(pathOrOptions)
    }
    /**
     * 插入文档
     * @param doc 
     */
    insert(doc: T | T[]) {
        return new Promise<T[]>((resolve, reject) => {
            this.db.insert(doc, (err, docs) => {
                if (err) reject(err)
                else resolve(Array.isArray(docs) ? docs : [docs])
            })
        })
    }
    /**
     * 查询文档
     * @param query 查询条件 
     * @param projection 约束
     */
    find(query: any, projection?: any) {
        return new Promise<T[]>((resolve, reject) => {
            this.db.find(query, projection, (err, docs) => {
                if (err) reject(err)
                else resolve(docs)
            })
        })
    }
    /**
     * 查询单个文档
     * @param query 查询条件 
     * @param projection 
     */
    findOne(query: any, projection?: any) {
        return new Promise<T>((resolve, reject) => {
            this.db.findOne(query, projection, (err, doc) => {
                if (err) reject(err)
                else resolve(doc)
            })
        })
    }
    /**
     * 更新文档
     * @param query 查询条件 
     * @param updateQuery 更新的数据
     * @param options 
     */
    update(query: any, updateQuery: any, options?: Nedb.UpdateOptions) {
        return new Promise<number>((resolve, reject) => {
            this.db.update(query, updateQuery, options, (err, num) => {
                if (err) reject(err)
                else resolve(num)
            })
        })
    }
    /**
     * 删除文档
     * @param query 
     * @param options 
     */
    remove(query: any, options: Nedb.RemoveOptions = {}) {
        return new Promise<number>((resolve, reject) => {
            this.db.remove(query, options, (err, n) => {
                if (err) reject(err)
                else resolve(n)
            })
        })
    }
    /**
     * 统计文档数量
     * @param query 
     */
    count(query: any) {
        return new Promise<number>((resolve, reject) => {
            this.db.count(query, (err, n) => {
                if (err) reject(err)
                else resolve(n)
            })
        })
    }

}
