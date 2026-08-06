import { request } from '../../api/client'

type CouponStatus = 'available' | 'used' | 'expired'
type Coupon = { id: string; value: string; title: string; note: string; date: string; status: string; state: CouponStatus; isAppVoucher?: boolean; redemptionId?: string; appVoucherClaimed?: boolean }

Page({
  data: { menuButtonTop: 0, menuButtonHeight: 0, activeStatus: 'available' as CouponStatus, coupons: [] as Coupon[], networkError: false, selectedAppVoucher: null as Coupon | null, appVoucherPhone: '', showAppVoucherDialog: false, claimingAppVoucher: false },
  onLoad() { const app = getApp<IAppOption>(); this.setData({ menuButtonTop: app.globalData.menuButtonTop, menuButtonHeight: app.globalData.menuButtonHeight }); this.loadCoupons('available') },
  async loadCoupons(status: CouponStatus) { try { this.setData({ coupons: await request<Coupon[]>(`/coupons?status=${status}`), networkError: false }) } catch { this.setData({ networkError: true }); wx.showToast({ title: '加载优惠券失败', icon: 'none' }) } },
  retryNetwork() { this.setData({ networkError: false }); this.loadCoupons(this.data.activeStatus) },
  selectStatus(event: WechatMiniprogram.CustomEvent<{ value: CouponStatus }>) { const activeStatus = event.detail.value; this.setData({ activeStatus }); this.loadCoupons(activeStatus) },
  openCoupon(event: WechatMiniprogram.TouchEvent) {
    const coupon = this.data.coupons[Number(event.currentTarget.dataset.index)]
    if (!coupon || !coupon.isAppVoucher || !coupon.redemptionId) return
    if (coupon.appVoucherClaimed) { wx.showToast({ title: '领取信息已提交', icon: 'none' }); return }
    this.setData({ selectedAppVoucher: coupon, appVoucherPhone: '', showAppVoucherDialog: true })
  },
  closeAppVoucherDialog() { this.setData({ selectedAppVoucher: null, appVoucherPhone: '', showAppVoucherDialog: false }) },
  preventDialogClose() {},
  onAppVoucherPhoneInput(event: WechatMiniprogram.Input) { this.setData({ appVoucherPhone: event.detail.value }) },
  async claimAppVoucher() {
    const phone = this.data.appVoucherPhone.trim()
    const coupon = this.data.selectedAppVoucher
    if (!/^1[3-9]\d{9}$/.test(phone)) { wx.showToast({ title: '请输入正确的手机号', icon: 'none' }); return }
    if (!coupon || !coupon.redemptionId || this.data.claimingAppVoucher) return
    this.setData({ claimingAppVoucher: true })
    try {
      await request(`/points/redemptions/${encodeURIComponent(coupon.redemptionId)}/app-voucher`, 'POST', { phone })
      this.closeAppVoucherDialog()
      await this.loadCoupons(this.data.activeStatus)
      wx.showToast({ title: '领取信息已提交', icon: 'success' })
    } catch (error) {
      wx.showToast({ title: error instanceof Error ? error.message : '领取失败', icon: 'none' })
    } finally { this.setData({ claimingAppVoucher: false }) }
  },
  goBack() { wx.navigateBack() },
})
