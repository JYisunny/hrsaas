// 专门处理权限路由的模块
import { constantRoutes, asyncRoutes } from '@/router'

const state = {
    // 一开始肯定 拥有静态路由权限
    routes: constantRoutes // 路由表   表示 当前用户所拥有的所有路由的数组
}
const mutations = {
    // 定义修改 routes的 mutations
    // payload 认为是我们登陆成功需要添加的 新路由
    setRoutes(state, newRoutes) {
        // state.routes = [...state.routes, ...newRoutes] // 写法正确 但  业务不正确
        state.routes = [...constantRoutes, ...newRoutes] // 每次都是在静态路由基础上 + 新路由
    }
}
const actions = {
    // 筛选权限路由
    // 第二个参数为 当前用户所拥有的菜单权限
    // menus: ["setting", "permissions", ...]
    // asyncRoutes  是所有的动态路由  
    // asyncRoutes  是数组(数组里有每个路由对象) => [{path:'/setting',name:'setting',component:''...},{},{},...]
    filterRoutes(context, menus) {
        const routes = []
            // 筛选出 动态路由中和menus中能够对应上的路由
        menus.forEach(key => {
                // key(item) 就是标识
                // asyncRoutes 找有没有对象中的 name属性等于 key => 未找到则没权限， 找到则有权限并筛选出来
                routes.push(...asyncRoutes.filter(item => item.name === key)) // 得到一个数组  有可能有元素 也有可能空数组
            })
            // 得到的routes是所有模块满足权限要求的路由数组
            // routes就是当前用户所拥有的  动态路由的权限
        context.commit('setRoutes', routes) // 相当于将动态路由提交给mutations
        return routes // Why return?  state数据  是用来显示左侧带单用的     return 是给路由addRoutes用的
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}