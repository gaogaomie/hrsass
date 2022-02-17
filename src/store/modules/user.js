
import { getToken, setToken, removeToken, setTimeStamp } from '@/utils/auth'
import { login, getUserInfo, getUserDetailById } from '@/api/user'

// 状态
const state = {
  token: getToken(),
  userInfo: {}// 定义一个空对象
}
// 修改状态
const mutations = {
// 获取token
  setToken(state, token) {
    state.token = token
    // 同步到本地缓存
    setToken(token)
  },

  // 删除token
  removeToken(state) {
    state.token = null
    removeToken()
  },
  // 获取用户信息
  setUserInfo(state, payload) {
    state.userInfo = payload // 响应式
  },
  // 删除用户信息
  removeUserInfo(state) {
    state.userInfo = {}
  }
}
// 执行异步
const actions = {

  async  login(context, data) {
    // 接口API
    const result = await login(data)
    // 这边不需要判断状态是否成功，判断条件前置在axios响应拦截器中已经设置好了
    context.commit('setToken', result)
    // 写入时间戳
    setTimeStamp() // 将当前的最新时间写入缓存
  },

  // 获取用户资料action
  async getUserInfo(context) {
    const result = await getUserInfo() // result就是用户的基本资料
    const baseInfo = await getUserDetailById(result.userId) // 为了获取头像
    const baseResult = { ...result, ...baseInfo } // 将两个接口结果合并
    // 获取用户的基本资料
    context.commit('setUserInfo', baseResult) // 将整个的个人信息设置到用户的vuex数据中
    return baseResult
  },
  // 退出用户

  logout(context) {
    // 删除token
    context.commit('removeToken') // 删除了缓存中的信息
    // 删除用户资料
    context.commit('removeUserInfo') // 删除用户信息
  }
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}
