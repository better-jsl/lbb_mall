import { request } from '../../api/client'

type CouponStatus = 'available' | 'used' | 'expired'
type Coupon = { id: string; value: string; title: string; note: string; date: string; status: string; state: CouponStatus }

Page({
  data: { menuButtonTop: 0, menuButtonHeight: 0, activeStatus: 'available' as CouponStatus, coupons: [] as Coupon[], networkError: false },
  onLoad() { const app = getApp<IAppOption>(); this.setData({ menuButtonTop: app.globalData.menuButtonTop, menuButtonHeight: app.globalData.menuButtonHeight }); this.loadCoupons('available') },
  async loadCoupons(status: CouponStatus) { try { this.setData({ coupons: await request<Coupon[]>(`/coupons?status=${status}`), networkError: false }) } catch { this.setData({ networkError: true }); wx.showToast({ title: '加载优惠券失败', icon: 'none' }) } },
  retryNetwork() { this.setData({ networkError: false }); this.loadCoupons(this.data.activeStatus) },
  selectStatus(event: WechatMiniprogram.CustomEvent<{ value: CouponStatus }>) { const activeStatus = event.detail.value; this.setData({ activeStatus }); this.loadCoupons(activeStatus) },
  goBack() { wx.navigateBack() },
})
