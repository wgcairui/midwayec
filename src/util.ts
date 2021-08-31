import { useRouter } from "vue-router"

type DateParameters = ConstructorParameters<typeof Date>[0]


export const date = (date: DateParameters = new Date()) => {
    const T = new Date(date)
    return `${T.getFullYear()}/${T.getMonth() + 1
        }/${T.getDate()} `
}
export const time = (date: DateParameters = new Date()) => {
    const T = new Date(date)
    return `${T.getHours()}:${T.getMinutes()}:${T.getSeconds()}`;
}
export const Milliseconds = (date: DateParameters = new Date()) => {
    const T = new Date(date)
    return `${T.getHours()}:${T.getMinutes()}:${T.getSeconds()}:${T.getMilliseconds()}`;
}
// 转换时间为易读的格式
export const parseTime = (time?: DateParameters) => {
    if (time) {
        const date = new Date(time)
        const h = date.getHours()
        const m = date.getMinutes()
        const s = date.getSeconds()
        return `${date.toLocaleDateString()} ${h}:${m}:${s}`
    }
    else return ''
}

// 转换时间为时分秒毫秒
export const parseTimeMilliseconds = (time?: DateParameters) => {
    if (time) {
        const date = new Date(time)
        const h = date.getHours()
        const m = date.getMinutes()
        const s = date.getSeconds()
        const ss = date.getMilliseconds()
        return `${h}:${m}:${s}:${ss}`
    }
    else return ''
}

// 获取N天之前的Date
export const getLasteDate = (day: number) => {
    const now = Date.now()
    return new Date(now - (864e5 * day))
}
