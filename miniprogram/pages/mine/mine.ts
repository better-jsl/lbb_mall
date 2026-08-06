import { request } from '../../api/client'
import { localImagePath } from '../../api/local-image'

type Stat = { label: string; value: string }
type SavedAddress = { region: string[] }
type ProfileSummary = { profile: { nickname: string; avatar: string; phone: string }; stats: Stat[] }

Page({
  data: {
    menuButtonTop: 0,
    menuButtonHeight: 0,
    menuButtonBottom: 0,
    addressSummary: '',
    nickname: '',
    avatar: '',
    stats: [] as Stat[],
    networkError: false,
    entries: [
      { icon: 'location', label: '地址设置', route: 'address' },
      { icon: 'file-paste', label: '我的订单', route: 'orders' },
    ],
  },
  onLoad() {
    const app = getApp<IAppOption>()
    this.setData({ menuButtonTop: app.globalData.menuButtonTop, menuButtonHeight: app.globalData.menuButtonHeight, menuButtonBottom: app.globalData.menuButtonBottom })
  },
  onShow() { const tabBar = this.getTabBar && this.getTabBar(); if (tabBar) tabBar.setData({ selected: 3 }); this.loadSummary(); this.loadAddressSummary() },
  async loadSummary() { try { const summary = await request<ProfileSummary>('/me/summary'); const avatar = await localImagePath(summary.profile.avatar); this.setData({ stats: summary.stats, nickname: summary.profile.nickname, avatar, networkError: false }) } catch { this.setData({ networkError: true }); wx.showToast({ title: '加载个人信息失败', icon: 'none' }) } },
  retryNetwork() { this.setData({ networkError: false }); this.loadSummary(); this.loadAddressSummary() },
  goVerification() {
    wx.scanCode({ scanType: ['qrCode', 'barCode'], success: async ({ result }) => {
      try { await request('/orders/verify', 'POST', { code: result }); wx.showToast({ title: '核销成功', icon: 'success' }); this.loadSummary() } catch { wx.showToast({ title: '核销失败', icon: 'none' }) }
    } })
  },
  openStat(event: WechatMiniprogram.TouchEvent) { const index = Number(event.currentTarget.dataset.index); const url = index === 0 ? '/pages/points-record/points-record' : index === 1 ? '/pages/coupons/coupons' : ''; if (url) wx.navigateTo({ url }) },
  async loadAddressSummary() {
    try {
      const saved = await request<SavedAddress | null>('/me/address')
      this.setData({ addressSummary: saved ? '已设置' : '' })
    } catch {
      this.setData({ addressSummary: '' })
    }
  },
  openEntry(event: WechatMiniprogram.TouchEvent) {
    const route = String(event.currentTarget.dataset.route)
    if (route === 'address') wx.navigateTo({ url: '/pages/common-address/common-address' })
    if (route === 'orders') wx.switchTab({ url: '/pages/orders/orders' })
  },
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '退出后将重新进行微信登录和授权。',
      success: (result) => {
        if (!result.confirm) return
        const app = getApp<IAppOption>()
        wx.removeStorageSync('lbb-auth-token')
        wx.setStorageSync('lbb-force-profile', true)
        app.globalData.authToken = ''
        app.globalData.profile = undefined
        app.globalData.needsProfile = true
        app.globalData.login()
        wx.reLaunch({ url: '/pages/index/index' })
      },
    })
  },
})
