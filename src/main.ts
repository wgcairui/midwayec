import { createApp } from 'vue'
import App from './App.vue'
import { store, key } from "./vuex"
import router from "./router"
import ElementPlus from 'element-plus'
import 'element-plus/lib/theme-chalk/index.css'
import "./ws"

const app = createApp(App)
app.use(router)
app.use(store, key)
app.use(ElementPlus)
app.mount('#app')