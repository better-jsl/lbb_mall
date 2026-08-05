import { request } from '../../api/client'
import { localImagePaths } from '../../api/local-image'

type PackageDetail = { title: string; price: string; points: string; contents: { name: string; count: string }[]; notices: string[]; coverImage: string; images: string[] }

Page({
  data: {
    menuButtonBottom: 0, menuButtonTop: 0, menuButtonHeight: 0, navOpacity: 0, activeBanner: 0,
    packageID: '', bannerImages: [] as string[],
    title: '', price: '', points: '', contents: [] as { name: string; count: string }[], notices: [] as string[],
    networkError: false,
  },

  onLoad(options: Record<string, string | undefined>) {
    const app = getApp<IAppOption>()
    const packageID = options.id ? decodeURIComponent(options.id) : ''
    this.setData({ menuButtonBottom: app.globalData.menuButtonBottom, menuButtonTop: app.globalData.menuButtonTop, menuButtonHeight: app.globalData.menuButtonHeight, packageID })
    if (packageID) this.loadPackage(packageID)
  },

  async loadPackage(packageID: string) {
    try {
      const detail = await request<PackageDetail>(`/packages/${packageID}`)
      const bannerImages = await localImagePaths(detail.images.length ? detail.images : detail.coverImage ? [detail.coverImage] : [])
      this.setData({ ...detail, bannerImages, activeBanner: 0, networkError: false })
    } catch { this.setData({ networkError: true }); wx.showToast({ title: '加载套餐失败', icon: 'none' }) }
  },

  retryNetwork() { if (this.data.packageID) { this.setData({ networkError: false }); this.loadPackage(this.data.packageID) } },

  onScroll(event: { detail: { scrollTop: number } }) { const navOpacity = Math.min(event.detail.scrollTop / 160, 1); if (Math.abs(this.data.navOpacity - navOpacity) > 0.01) this.setData({ navOpacity }) },
  onBannerChange(event: { detail: { current: number } }) { this.setData({ activeBanner: event.detail.current }) },
  previewBanner(event: WechatMiniprogram.TouchEvent) { wx.previewImage({ current: String(event.currentTarget.dataset.current), urls: this.data.bannerImages }) },
  goBack() { wx.navigateBack() },

  async buyNow() {
    try {
      await request<{ id: string }>('/orders', 'POST', { packageId: this.data.packageID })
      wx.showToast({ title: '下单成功', icon: 'success' })
    } catch { wx.showToast({ title: '下单失败', icon: 'none' }) }
  },
})
