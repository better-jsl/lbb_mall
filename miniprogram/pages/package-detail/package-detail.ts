Page({
  data: {
    menuButtonBottom: 0,
    menuButtonTop: 0,
    menuButtonHeight: 0,
    navOpacity: 0,
    activeBanner: 0,
    bannerImages: [
      '/assets/package-banner.jpg',
      '/assets/package-banner-2.jpg',
      '/assets/package-banner-3.jpg',
    ],
    title: '名仕洋酒套餐',
    price: '1580',
    points: '1264',
    contents: [
      { name: '名仕洋酒', count: '1 瓶' },
      { name: '精选果盘', count: '1 份' },
      { name: '小吃拼盘', count: '1 份' },
    ],
    notices: [
      '本套餐仅限下单门店使用，不可跨店兑换。',
      '下单后请在有效期内预约到店，逾期自动失效。',
      '未成年人禁止购买及饮用酒类商品。',
    ],
  },

  onLoad(options: Record<string, string | undefined>) {
    const app = getApp<IAppOption>()

    this.setData({
      menuButtonBottom: app.globalData.menuButtonBottom,
      menuButtonTop: app.globalData.menuButtonTop,
      menuButtonHeight: app.globalData.menuButtonHeight,
      title: options.title ? decodeURIComponent(options.title) : this.data.title,
      price: options.price ? decodeURIComponent(options.price) : this.data.price,
      points: options.points ? decodeURIComponent(options.points) : this.data.points,
    })
  },

  onScroll(event: { detail: { scrollTop: number } }) {
    const navOpacity = Math.min(event.detail.scrollTop / 160, 1)

    if (Math.abs(this.data.navOpacity - navOpacity) > 0.01) {
      this.setData({ navOpacity })
    }
  },

  onBannerChange(event: { detail: { current: number } }) {
    this.setData({ activeBanner: event.detail.current })
  },

  previewBanner(event: WechatMiniprogram.TouchEvent) {
    wx.previewImage({
      current: String(event.currentTarget.dataset.current),
      urls: this.data.bannerImages,
    })
  },

  goBack() {
    wx.navigateBack()
  },

  buyNow() {
    wx.showToast({
      title: '购买功能待接入',
      icon: 'none',
    })
  },
})
