import { createApp } from 'vue'
import App from './App.vue'
import Toast, { POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

const app = createApp(App)
app.use(Toast, {
  position: 'bottom-right',
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  hideProgressBar: false,
  maxToasts: 5,
  newestOnTop: true,
})
app.mount('#app')
