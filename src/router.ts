import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"

const index = () => import("./pages/index.vue")

const alarm = () => import("./pages/manage/alarm.vue")
const dataCount = () => import("./pages/manage/dataCount.vue")
const console = () => import("./pages/manage/console.vue")
const device = () => import("./pages/manage/device.vue")
const ioManage = () => import("./pages/manage/io.vue")
const osInfo = () => import("./pages/manage/osInfo.vue")
const PiInfo = () => import("./pages/manage/PiInfo.vue")
const protocol = () => import("./pages/manage/protocol.vue")
const protocolInstruct = () => import("./pages/manage/protocolInstruct.vue")
const serial = () => import("./pages/manage/serial.vue")
const user = () => import("./pages/manage/user.vue")

const air = () => import("./pages/device/air.vue")
const em = () => import("./pages/device/em.vue")
const io = () => import("./pages/device/io.vue")
const line = () => import("./pages/device/line.vue")
const th = () => import("./pages/device/th.vue")
const ups = () => import("./pages/device/ups.vue")

// 1. 定义路由组件.
// 也可以从其他文件导入
const Home = { template: '<div>Home</div>' }
const About = { template: '<div>About</div>' }

// 2. 定义一些路由
// 每个路由都需要映射到一个组件。
// 我们后面再讨论嵌套路由。
const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: index,
        name: "index",
        meta: {
            name: "首页"
        }
    },
    {
        path: '/alarm',
        component: alarm,
        name: "alarm",
        meta: { name: "告警设置" }
    },
    {
        path: '/dataCount',
        component: dataCount,
        name: "dataCount",
        meta: {
            name: "数据统计"
        }
    },
    {
        path: '/device',
        component: device,
        name: "device",
        meta: {
            name: "设备设置"
        }
    },
    {
        path: '/ioManage',
        component: ioManage,
        name: "ioManage",
        meta: {
            name: "IO设置"
        }
    },
    {
        path: "/serial",
        component: serial,
        name: "serial",
        meta: {
            name: "串口设置"
        }
    },
    {
        path: "/protocol",
        name: "protocol",
        component: protocol,
        meta: {
            name: "协议管理"
        }
    },
    {
        path: "/user",
        name: "user",
        component: user,
        meta: {
            name: "账号设置"
        }
    },
    {
        path: "/osInfo",
        name: "osInfo",
        component: osInfo,
        meta: {
            name: "系统信息"
        }
    },
    {
        path: "/PiInfo",
        name: "PiInfo",
        component: PiInfo,
        meta: {
            name: "环控信息"
        }
    },
    {
        path: "/console",
        name: "console",
        component: console,
        meta: {
            name: "调试"
        }
    },
    {
        path: "/protocolInstruct",
        name: "protocolInstruct",
        component: protocolInstruct,
        meta: {
            name: "协议详情"
        }
    },
    {
        path: "/air",
        name: "air",
        component: air,
        meta: {
            name: "空调"
        }
    },
    {
        path: "/em",
        name: "em",
        component: em,
        meta: {
            name: "电量仪"
        }
    },
    {
        path: "/io",
        name: "io",
        component: io,
        meta: {
            name: "IO"
        }
    },
    {
        path: "/line",
        name: "line",
        component: line,
        meta: {
            name: "历史数据"
        }
    },
    {
        path: "/th",
        name: "th",
        component: th,
        meta: {
            name: "温湿度"
        }
    },
    {
        path: "/ups",
        name: "ups",
        component: ups,
        meta: {
            name: "UPS"
        }
    }
]

// 3. 创建路由实例并传递 `routes` 配置
// 你可以在这里输入更多的配置，但我们在这里
// 暂时保持简单
const router = createRouter({
    // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
    history: createWebHistory(),
    routes, // `routes: routes` 的缩写
})

export default router
