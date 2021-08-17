import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"
const alarm = () => import("./components/manage/alarm.vue")
const console = () => import("./components/manage/console.vue")
const device = () => import("./components/manage/device.vue")
const osInfo = () => import("./components/manage/osInfo.vue")
const PiInfo = () => import("./components/manage/PiInfo.vue")
const protocol = () => import("./components/manage/protocol.vue")
const protocolInstruct = () => import("./components/manage/protocolInstruct.vue")
const serial = () => import("./components/manage/serial.vue")
const user = () => import("./components/manage/user.vue")

// 1. 定义路由组件.
// 也可以从其他文件导入
const Home = { template: '<div>Home</div>' }
const About = { template: '<div>About</div>' }

// 2. 定义一些路由
// 每个路由都需要映射到一个组件。
// 我们后面再讨论嵌套路由。
const routes: RouteRecordRaw[] = [
    { path: '/alarm', component: alarm },
    //{ path: '/dataCount', component: dataCount },
    //{ path: '/device', component: device },
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
