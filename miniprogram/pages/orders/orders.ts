type OrderStatus = 'pending' | 'verified' | 'expired'

type Order = {
  id: string
  title: string
  merchant: string
  price: string
  status: string
  state: OrderStatus
}

const allOrders: Order[] = [
  { id: 'order-1', title: '名仕洋酒套餐', merchant: '梦田', price: '1,580', status: '待核销', state: 'pending' },
  { id: 'order-2', title: '喜力啤酒套餐', merchant: '柏林之声', price: '498', status: '待核销', state: 'pending' },
  { id: 'order-3', title: '百威小酌套餐', merchant: '欢乐迪', price: '39.9', status: '已核销', state: 'verified' },
  { id: 'order-4', title: '野格欢喜套餐', merchant: '欢唱', price: '298', status: '已失效', state: 'expired' },
]

Page({
  data: {
    menuButtonTop: 0,
    menuButtonHeight: 0,
    activeStatus: 'pending' as OrderStatus,
    showOrderAnimation: true,
    orders: allOrders.filter((item) => item.state === 'pending'),
  },

  onLoad() {
    const app = getApp<IAppOption>()

    this.setData({
      menuButtonTop: app.globalData.menuButtonTop,
      menuButtonHeight: app.globalData.menuButtonHeight,
    })
  },

  onShow() {
    const tabBar = this.getTabBar && this.getTabBar()

    if (tabBar) {
      tabBar.setData({ selected: 1 })
    }
  },

  selectStatus(event: WechatMiniprogram.CustomEvent<{ value: OrderStatus }>) {
    const activeStatus = event.detail.value

    this.setData(
      {
        activeStatus,
        orders: allOrders.filter((item) => item.state === activeStatus),
        showOrderAnimation: false,
      },
      () => {
        wx.nextTick(() => this.setData({ showOrderAnimation: true }))
      },
    )
  },

  showOrderDetail(event: WechatMiniprogram.TouchEvent) {
    const { title, merchant, price, status } = event.currentTarget.dataset

    wx.navigateTo({
      url: `/pages/order-detail/order-detail?title=${encodeURIComponent(String(title))}&merchant=${encodeURIComponent(String(merchant))}&price=${encodeURIComponent(String(price))}&status=${encodeURIComponent(String(status))}`,
    })
  },
})
