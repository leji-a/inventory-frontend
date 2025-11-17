// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import { waitForRehydration } from './stores/utils/rehydration'
import { appInit } from './stores/utils/appInit'

const app = createApp(App)

// Create and configure Pinia
const pinia = createPinia()
pinia.use(piniaPersistedstate)
app.use(pinia)
app.use(router)

// Wait for persisted stores to rehydrate
await waitForRehydration()
app.mount('#app')

// Global app initialization: fetch initial data, etc.
await appInit()

