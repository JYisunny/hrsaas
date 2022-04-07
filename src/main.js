import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import Components from '@/components'

import * as directives from '@/directives'
import * as filters from '@/filters'
import i18n from '@/lang'
import CheckPermission from '@/mixins/checkPermission'
import '@/icons' // icon
import '@/permission' // permission control

// set ElementUI lang to EN
// Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
Vue.use(ElementUI, {
  // element 本身支持 i18n 处理
  // 此时 i18n 会根据当前的 locale 属性去寻找对应的显示内容
  i18n: (key, value) => i18n.t(key) // t 方法 会去对应的语言包里寻找对应的内容
    // 改变locale 值 就可以改变对应的当前语言
})

// for in
// console.log(Object.keys(directives))
Object.keys(directives).forEach(key => {
  // console.log(directives[key]) // 对象inserted函数 // key相当于item (属性名=> imagerror)
  Vue.directive(key, directives[key]) // 注册自定义指令
})
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key]) // 注册自定义过滤器
})

// 注册自定义组件
Vue.use(Components)

// 全局混入检查对象
Vue.mixin(CheckPermission) // 表示所有组件都拥有了检查的方法

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App)
})