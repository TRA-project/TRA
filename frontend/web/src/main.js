import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import store from './store'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';

import * as echarts from 'echarts';

Vue.prototype.$echarts = echarts
Vue.config.productionTip = false;
Vue.use(Antd);
Vue.prototype.$axios = axios;
axios.defaults.baseURL='/api';

const axiosInstance = axios.create({
  baseURL: process.env.NODE_ENV==="production"? "/":"/",
  headers: {
    "content-type": "application/json",
  },
  timeout: 600000,
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem('Authorization');
          localStorage.removeItem('Username');
          this.$router.push('/');
      }
    }
    return Promise.reject(error);
  }
);

axios.interceptors.request.use(
  config => {
    if (localStorage.getItem('Authorization')) {
      config.headers.Authorization = localStorage.getItem('Authorization');
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export { axiosInstance };
Vue.prototype.$axios = axiosInstance;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
