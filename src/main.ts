import { createApp } from 'vue'
import App from './App.vue'
import { store, key } from "./vuex"
import router from "./router"
import ElementPlus from 'element-plus'
import 'element-plus/lib/theme-chalk/index.css'
import "./ws"

// https://echarts.apache.org/zh/tutorial.html#%E5%9C%A8%E6%89%93%E5%8C%85%E7%8E%AF%E5%A2%83%E4%B8%AD%E4%BD%BF%E7%94%A8%20ECharts
import { use } from "echarts/core"
// 加载svg渲染器
import { CanvasRenderer } from "echarts/renderers"
// 加载通用工具component
import { TitleComponent, TooltipComponent, LegendComponent, ToolboxComponent } from "echarts/components"
// 注册
use([CanvasRenderer, TitleComponent, ToolboxComponent, TooltipComponent, LegendComponent])

const app = createApp(App)
app.use(router)
app.use(store, key)
app.use(ElementPlus)
app.mount('#app')