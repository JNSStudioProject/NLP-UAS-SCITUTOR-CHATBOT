import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './index.css'

import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

const authStore = useAuthStore()

// Initialize auth before mounting so router guards know the session state
authStore.initialize().then(() => {
  app.use(router)
  app.mount('#app')
})
