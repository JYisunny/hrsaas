import store from "@/store"
// 做一个混入对象
export default {
  // 混入对象是组件的选项对象
  methods: {
    // 检查权限  要么有  要么没有   key就是要检查的点
    checkPermission(key) {
      // 去用户的信息里找 points中有没有key 有key则有权限 无key则无权限(不能点击按钮)
      const { userInfo } = store.state.user
      if (userInfo.roles && userInfo.roles.points) {
        return userInfo.roles.points.some(item => item === key)
      }
      return false // 如果没进if 说明没权限 直接返回 false
    }
  }
}