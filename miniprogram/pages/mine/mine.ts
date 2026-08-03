Page({
  data: {
    menuButtonBottom: 0,
    stats: [
      { label: '积分', value: '1264' },
      { label: '优惠券', value: '3' },
      { label: '收藏', value: '8' },
    ],
    entries: [
      { icon: 'location', label: '常用地址' },
    ],
  },

  onLoad() {
    const app = getApp<IAppOption>()

    this.setData({
      menuButtonBottom: app.globalData.menuButtonBottom,
    })
  },

  onShow() {
    const tabBar = this.getTabBar && this.getTabBar()

    if (tabBar) {
      tabBar.setData({ selected: 2 })
    }
  },

  goVerification() {
    wx.scanCode({
      scanType: ['qrCode', 'barCode'],
    })
  },

  openStat(event: WechatMiniprogram.TouchEvent) {
    const index = Number(event.currentTarget.dataset.index)
    const url = index === 0 ? '/pages/points-record/points-record' : index === 1 ? '/pages/coupons/coupons' : ''

    if (url) {
      wx.navigateTo({ url })
    }
  },
})
