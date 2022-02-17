const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token, // token数值
  avatar: state => state.user.avatar, // 头像
  name: state => state.user.name, // 名字
  staffPhoto: state => state.user.userInfo.staffPhoto // 建立用户头像的映射
  // companyId: state => state.user.userInfo.staffPhoto // 建立公司id的快捷访问
}
export default getters
