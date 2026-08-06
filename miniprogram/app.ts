import { loginWithWeChat } from './api/client'

App<IAppOption>({
  globalData: {
    menuButtonBottom: 0,
    menuButtonTop: 0,
    menuButtonHeight: 0,
    authToken: '',
    loginReady: Promise.resolve(),
    needsProfile: false,
    login: () => {},
  },
  onLaunch() {
    const systemInfo = wx.getSystemInfoSync()
    const menuButton = wx.getMenuButtonBoundingClientRect()

    const statusBarHeight = systemInfo.statusBarHeight || 0
    const menuButtonTop = menuButton.top || statusBarHeight + 6
    const menuButtonHeight = menuButton.height || 32

    this.globalData.menuButtonTop = menuButtonTop
    this.globalData.menuButtonHeight = menuButtonHeight
    this.globalData.menuButtonBottom = menuButton.bottom || menuButtonTop + menuButtonHeight

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    this.globalData.login = () => {
      this.globalData.loginReady = new Promise((resolve) => wx.login({
        success: async (res) => {
          try {
            const session = await loginWithWeChat(res.code)
            this.globalData.authToken = session.token
            this.globalData.profile = session.profile
            this.globalData.needsProfile = session.needsProfile || Boolean(wx.getStorageSync('lbb-force-profile'))
            wx.setStorageSync('lbb-auth-token', session.token)
          } catch (error) {
            wx.showToast({ title: error instanceof Error ? error.message : '微信登录失败', icon: 'none' })
          } finally {
            resolve()
          }
        },
        fail: () => {
          wx.showToast({ title: '微信登录失败', icon: 'none' })
          resolve()
        },
      }))
    }
    this.globalData.login()
  },
})
