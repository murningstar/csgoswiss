import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import components from '@/components/components.js'
import router from './router.js'


let app = createApp(App);
components.forEach( (component)=>{
    app.component(component.name, component)
})

app.use(router)

app.mount('#app')
