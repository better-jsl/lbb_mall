import { authorizeWechatPhone, updateWechatProfile, uploadWechatAvatar } from '../../api/client'

Component({
  data: {
    visible: false,
    step: 'phone',
    avatarPreview: '',
    avatarURL: '',
    nickname: '',
    saving: false,
  },
  lifetimes: {
    attached() {
      const app = getApp<IAppOption>()
      app.globalData.loginReady.then(() => {
        const profile = app.globalData.profile
        this.setData({ visible: app.globalData.needsProfile, step: profile && profile.phone ? 'profile' : 'phone' })
      })
    },
  },
  methods: {
    async chooseAvatar(event: WechatMiniprogram.CustomEvent<{ avatarUrl: string }>) {
      const avatarPreview = event.detail.avatarUrl
      if (!avatarPreview) return
      this.setData({ avatarPreview })
      try {
        const avatarURL = await uploadWechatAvatar(avatarPreview)
        this.setData({ avatarURL })
      } catch (error) {
        wx.showToast({ title: error instanceof Error ? error.message : '头像上传失败', icon: 'none' })
      }
    },
    inputNickname(event: WechatMiniprogram.Input) {
      this.setData({ nickname: event.detail.value })
    },
    async authorizePhone(event: WechatMiniprogram.CustomEvent<{ code?: string }>) {
      const phoneCode = event.detail.code
      if (!phoneCode) {
        wx.showToast({ title: '手机号授权未完成', icon: 'none' })
        return
      }
      this.setData({ saving: true })
      try {
        const session = await authorizeWechatPhone(phoneCode)
        const app = getApp<IAppOption>()
        app.globalData.authToken = session.token
        app.globalData.profile = session.profile
        wx.setStorageSync('lbb-auth-token', session.token)
        this.setData({ step: 'profile' })
      } catch (error) {
        wx.showToast({ title: error instanceof Error ? error.message : '手机号授权失败', icon: 'none' })
      } finally {
        this.setData({ saving: false })
      }
    },
    async confirmProfile() {
      const nickname = this.data.nickname.trim()
      if (!this.data.avatarURL) {
        wx.showToast({ title: '请先选择微信头像', icon: 'none' })
        return
      }
      if (!nickname) {
        wx.showToast({ title: '请填写微信昵称', icon: 'none' })
        return
      }
      this.setData({ saving: true })
      try {
        const profile = await updateWechatProfile({ nickname, avatar: this.data.avatarURL })
        const app = getApp<IAppOption>()
        app.globalData.profile = profile
        app.globalData.needsProfile = false
        wx.removeStorageSync('lbb-force-profile')
        this.setData({ visible: false })
        this.triggerEvent('authorized', profile)
      } catch (error) {
        wx.showToast({ title: error instanceof Error ? error.message : '资料授权失败', icon: 'none' })
      } finally {
        this.setData({ saving: false })
      }
    },
  },
})
