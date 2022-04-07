import axios from "axios"
import store from "@/store"
import router from "@/router"
import { Message } from 'element-ui'
import { getTimeStamp } from '@/utils/auth'

const TimeOut = 5400 // 定义超时时间(差)

const service = axios.create({
    // 当执行 npm run dev  => .env.development => /api  => 跨域
    baseURL: process.env.VUE_APP_BASE_API, // npm run dev =>  /api  |  npm run build =>  /prod-api
    timeout: 5000 // 设置超时时间
})

// 请求拦截器
service.interceptors.request.use(config => {
    // config 是请求的配置信息
    // 注入token
    if (store.getters.token) {
        // 只有在 有 token情况下， 才有必要去检查时间戳 是否超时
        if (IsCheckTimeOut()) {
            // 为 true 表示 Token失效
            // Token失效 则需要删除
            store.dispatch('user/logout') // 登出操作
                // 跳转到登录页
            router.push('/login')
            return Promise.reject(new Error('token超时了'))
        }
        config.headers['Authorization'] = `Bearer ${store.getters.token}`
    }
    return config // 必须要返回
}, error => {
    return Promise.reject(error)
})

// 响应拦截器
service.interceptors.response.use(response => {
    // axios默认加一层data
    const { success, message, data } = response.data
        // 根据 success 成功与否决定下面操作
    if (success) {
        return data
    } else {
        // 业务已经错误 还能进then ? 不能 ！ 应该进 catch
        Message.error(message) // 提示错误消息
        return Promise.reject(new Error(message)) // 没有错误对象，认为实例化一个错误对象
    }
}, error => {
    // error 信息 里面 response的对象
    if (error.response && error.response.data && error.response.data.code === 10002) {
        // code = 10002时，表示 后端告诉我们 token超时了
        store.dispatch('user/logout') // 登出action 删除token
        router.push('/login')
    } else {
        Message.error(error.message) // 提示错误信息
    }
    return Promise.reject(error) // 返回执行错误 让当前的执行链跳出成功 直接进入catch
})

// 是否超时
// 超时逻辑:    (当前时间  -  缓存中的时间)  是否大于  时间差
function IsCheckTimeOut() {
    var currentTime = Date.now() // 当前时间戳
    var timeStamp = getTimeStamp() // 缓存时间戳
    return (currentTime - timeStamp) / 1000 > TimeOut
}

export default service