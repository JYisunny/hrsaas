import { getToken, setToken, removeToken, setTimeStamp } from '@/utils/auth'
import { login, getUserInfo, getUserDetailById } from '@/api/user'
import { resetRouter } from '@/router'

// 状态
const state = {
  token: getToken(), // 设置token为共享状态  初始化vuex的时候  就先从缓存中读取
  userInfo: {} /* : null */ // 这里定义一个空对象  Why?  getters中引用userinfo变量，如果设为null，则会引起异常和报错
}

// 修改状态
const mutations = {
  setToken(state, token) {
    state.token = token // 将数据设置给 vuex
    setToken(token) // vuex变化  同步给缓存
  },
  removeToken(state) {
    state.token = null // 将vuex的数据置空
    removeToken() // 再清除缓存， vuex和 缓存数据的同步
  },
  // 设置用户信息
  setUserInfo(state, result) {
    // 更新一个对象
    state.userInfo = result // 这样是响应式
      // state.userInfo = {...result } // 这样也是响应式 属于浅拷贝
      // state.userInfo['username'] = result // 这样才不是响应式
  },
  // 删除用户信息
  removeUserInfo(state) {
    state.userInfo = {}
  }
}

// 执行异步
const actions = {
  async login(context, data) {
    const result = await login(data) // 调用 api 接口  // 拿到token (data 是用户token)
      // if (result.data.success) { // axios 默认加了一层 data
      //     context.commit('setToken', result.data.data)
      // }
      // 拦截器添加后 即
    context.commit('setToken', result) // 设置token
      // 拿到token说明登录成功 则存入时间戳
    setTimeStamp()
  },
  async getUserInfo(context) {
    const result = await getUserInfo()
      // 根据id获取用户详情 用户的详情数据
    const baseInfo = await getUserDetailById(result.userId)
    context.commit('setUserInfo', {...result, ...baseInfo }) // 提交到mutations
    return result // Why? 这里是给我们后期做权限的时候 留下的伏笔
  },
  // 登出操作
  logout(context) {
    // 删除token
    context.commit('removeToken') // 不仅删除vuex中的 还删除了缓存中的
      // 删除用户资料
    context.commit('removeUserInfo')
      // 重置路由
    resetRouter()
      // 去设置权限模块  下的路由为初始状态
      // Vuex子模块怎么调用子模块action (都没加锁情况下 可以所以调用)
      // 不加命名空间的情况下  所有的mutations 和 actions 都是挂在全局上的  所以可以直接调用
      // 但是加了命名空间的子模块  怎么调用另一个加了命名空间的子模块 mutations
      // 加了命名空间的context指的不是全局的 context
      // mutations名称  载荷payload  第三个参数 { root: true } 调用根级的 mutations或者 actions
    context.commit('permission/setRoutes', [], { root: true })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}