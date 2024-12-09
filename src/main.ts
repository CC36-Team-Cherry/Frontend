import './assets/style.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedState from 'pinia-plugin-persistedstate';
import Toast, { type PluginOptions } from "vue-toastification";
import "vue-toastification/dist/index.css";

import App from './App.vue';
import router from './router';
import i18n from './i18n'; 

const app = createApp(App);
const pinia = createPinia();

pinia.use(piniaPluginPersistedState);

const options: PluginOptions = {
    // Default options go here if we want to change anything
};

app.use(pinia);
app.use(router);
app.use(i18n); 
app.use(Toast, options);

app.mount('#app');



