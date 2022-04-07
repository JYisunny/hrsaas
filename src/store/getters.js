const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token, // 建立token的快捷访问
  name: state => state.user.userInfo.username, // 建立用户名的快捷访问
  userId: state => state.user.userInfo.userId, // 建立用户Id 的快捷访问
  staffPhoto: state => state.user.userInfo.staffPhoto, // 建立用户头像 的快捷访问
  companyId: state => state.user.userInfo.companyId, // 建立企业ID 的快捷访问
  routes: state => state.permission.routes // 建立权限模块下的快捷访问
}
export default getters