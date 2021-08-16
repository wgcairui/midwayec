import { Provide, Scope, ScopeEnum, Init } from "@midwayjs/decorator"
import BetterSqlite3, { Database } from "better-sqlite3"
import fs from "fs"
import { Ec } from "../interface"


interface clientresult {
    id: number,
    devid: string,
    timeStamp: number,
    result: string
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class Sqlite {
    private db: Database
    private colltion: string
    private dbname: string
    private sql: { init: BetterSqlite3.Statement<any[]>; insert: BetterSqlite3.Statement<any>; select: BetterSqlite3.Statement<any>; delete: BetterSqlite3.Statement<any[]>; count: BetterSqlite3.Statement<any>; min: BetterSqlite3.Statement<any> }

    @Init()
    async init() {
        this.dbname = 'ladisec.db'
        this.db = new BetterSqlite3(this.dbname, { verbose: () => { } })
        /** 设备历史数据表 */
        this.colltion = "clientresultcolltions"
        try {
            this.db.exec(`SELECT * FROM ${this.colltion} WHERE id = 1`)
        } catch (error) {
            console.log('sqlite数据表未创建,正在创建');
            this.db.exec(`CREATE TABLE ${this.colltion}(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                devid TEXT,
                timeStamp INT,
                result TEXT
            )`)
        }


        this.sql = {
            init: this.db.prepare<number>(`DELETE FROM ${this.colltion} `),
            insert: this.db.prepare<Ec.Mountdev & { result: Uart.queryResultArgument[] }[]>(`INSERT INTO ${this.colltion} (devid,timeStamp,result) VALUES (@devid,@timeStamp,@result)`),
            select: this.db.prepare<clientresult>(`SELECT * FROM ${this.colltion} WHERE devid = @devid AND timeStamp BETWEEN @startTime AND @endTime`),
            delete: this.db.prepare(`DELETE FROM ${this.colltion} WHERE devid = @devid`),
            count: this.db.prepare(`SELECT devid, count(*) FROM ${this.colltion} GROUP BY devid`),//`SELECT count(*) FROM ${this.colltion}`),
            min: this.db.prepare(`SELECT devid, min(timeStamp) FROM ${this.colltion} GROUP BY devid`)
        }
    }
    /**
     * 权标删除
     */
    inits() {
        this.sql.init.run({})
        return this.VACUUM()
    }

    private VACUUM() {
        const migration = fs.readFileSync('./sql/VACUUM.sql', 'utf8')
        return this.db.exec(migration)
    }

    insert(devid: string, timeStamp: number, result: Uart.queryResultArgument[]) {
        // console.log({ devid, timeStamp, result });
        return this.sql.insert.run({ devid, timeStamp, result: JSON.stringify(result) })
    }
    all(devid: string, startTime: number, endTime: number): clientresult[] {
        return this.sql.select.all({ devid, startTime, endTime })
    }
    /**
     * 删除数据表中指定id的数据
     * @param devid 设备id
     */
    delete(devid: string) {
        this.sql.delete.run({ devid })
        return this.VACUUM()
    }

    /** 統計数据库大小,每个设备数据库条目数,最久时间 */
    async count() {
        const PdbSize = fs.promises.stat(this.dbname)
        //const count = this.sql.count.all({}) as {devid:string,'count(*)':number}[]
        //const min =this.sql.min.all({}) as {devid:string,'min(timeStamp)':number}[]
        /* console.log({ dbSize, count, min });
        
        return { dbSize, count, min } */
        const Pcount = new Promise<{ devid: string, 'count(*)': number }[]>(resolve => {
            resolve(this.sql.count.all({}))
        })
        const Pmin = new Promise<{ devid: string, 'min(timeStamp)': number }[]>(resolve => {
            resolve(this.sql.min.all({}))
        })

        const [dbSize, count, min] = await Promise.all([PdbSize, Pcount, Pmin])

        return { dbSize: dbSize.size / 1024 / 1024, count, min }
    }

    /**
     * 备份数据库
     * @param name  备份的数据库名称
     * @returns 返回备份的数据库名称
     */
    async backup(name: string = new Date().toDateString() + '_back_' + this.db) {
        name = name + '.db'
        if (fs.existsSync(name)) fs.rmSync(name)
        const info = await this.db.backup(name)
        if (fs.existsSync(name)) {
            const stream = fs.createReadStream(name)
            stream.on('close', () => {
                console.log('stream close');
                fs.rmSync(name)
            })
            return { name, stream }
        } else return false
    }
}

