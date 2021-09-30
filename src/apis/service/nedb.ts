import { Provide, Scope, ScopeEnum, Init } from "@midwayjs/decorator"
import nedb from "nedb"
import { join } from "path"
import { Ec } from "../interface"

type QueryMethond = "$lt" | "$lte" | "$gt" | "$gte" | "$in" | "$nin" | "$ne" | "_id"

type Query<T> = { [P in keyof T]?: T[P] | Partial<Record<QueryMethond, T[P]>> | Partial<T>[] } & { _id?: string }

type UpdateMethod = "$set" | "$unset" | "$inc" | "$min" | "$max" | "$push" | "$pop" | "$addToSet" | "$pull" | "$each$slice"

type Update<T> = Partial<T> | Partial<Record<UpdateMethod, { [P in keyof T]?: T[P] } & { [x in string]: any }>>


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
    resultSingles: nedbPromise<Ec.SingleData>
    /** 设备型号信息 */
    devTypes: nedbPromise<Uart.DevsType>
    /** 树莓派串口信息 */
    bindserials: nedbPromise<Ec.BindSerial>
    /**
     * dido信息
     */
    ios: nedbPromise<Ec.ioInfo>
    /**
     * 告警联动
     */
    alarmLinkage: nedbPromise<Ec.alarmLinkage>
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
        this.ios = new nedbPromise({ filename: path + '/ios.json', autoload: true })
        this.alarmLinkage = new nedbPromise({ filename: path + '/alarmLinkage.json', autoload: true })
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
    find(query: Query<T>, projection?: Partial<Record<keyof T, 0 | 1>>) {
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
    findOne(query: Query<T>, projection?: Partial<Record<keyof T, 0 | 1>>) {
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
    update(query: Query<T>, updateQuery: Update<T>, options: Nedb.UpdateOptions = {}) {
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
    count(query: Query<T>) {
        return new Promise<number>((resolve, reject) => {
            this.db.count(query, (err, n) => {
                if (err) reject(err)
                else resolve(n)
            })
        })
    }

}
