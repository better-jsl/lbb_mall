import { request } from '../../api/client'

type OrderContent = { name: string; count: string; isPoints?: boolean }
type OrderDetail = { title: string; merchant: string; price: string; priceText: string; status: string; state: string; statusIcon: string; statusNote: string; canUsePoints: boolean; canVerify: boolean; sectionTitle: string; contents: OrderContent[]; orderNo: string; createdAt: string }

Page({
  data: { menuButtonTop: 0, menuButtonHeight: 0, orderID: '', title: '', merchant: '', price: '', priceText: '', status: '', state: '', statusIcon: 'time', statusNote: '', canUsePoints: false, canVerify: false, sectionTitle: '套餐信息', contents: [] as OrderContent[], orderNo: '', createdAt: '', networkError: false },
  onLoad(options: Record<string, string | undefined>) {
    const app = getApp<IAppOption>(); const id = options.id ? decodeURIComponent(options.id) : ''
    this.setData({ menuButtonTop: app.globalData.menuButtonTop, menuButtonHeight: app.globalData.menuButtonHeight, orderID: id })
    if (id) this.loadOrder(id)
  },
  async loadOrder(id: string) { try { this.setData({ ...await request<OrderDetail>(`/orders/${id}`), networkError: false }) } catch { this.setData({ networkError: true }); wx.showToast({ title: '加载订单失败', icon: 'none' }) } },
  retryNetwork() { if (this.data.orderID) { this.setData({ networkError: false }); this.loadOrder(this.data.orderID) } },
  verifyOrder() {
    wx.scanCode({
      scanType: ['qrCode', 'barCode'],
      success: async ({ result }) => {
        try {
          await request('/orders/verify', 'POST', { code: result, orderId: this.data.orderID })
          wx.showToast({ title: '核销成功', icon: 'success' })
          if (this.data.orderID) this.loadOrder(this.data.orderID)
        } catch {
          wx.showToast({ title: '核销失败', icon: 'none' })
        }
      },
    })
  },
  openExchange() {
    wx.setStorageSync('mallActiveTab', 'exchange')
    wx.switchTab({ url: '/pages/index/index' })
  },
  goBack() { wx.navigateBack() },
})
