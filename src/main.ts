import { debugLog } from './utils/log'
import { createApp } from 'vue'
import App from './App.vue'
// 加入svg图标支持
import 'vite-plugin-svg-icons/register'

import '@/styles/index.scss'

import router, { setupRouter } from './route'
import { setStore } from '@/store'
import { setDirective } from '@/directive'

debugLog(router)
const app = createApp(App)
setupRouter(app)
setStore(app)
setDirective(app)

app.mount('#app')
