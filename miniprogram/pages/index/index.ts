import { request } from '../../api/client'
import { localImagePath } from '../../api/local-image'

type Merchant = { id: string; name: string; subtitle?: string; pinyin: string; marquee?: boolean; marqueeDuration?: string }
type PackageCard = { id: string; title: string; price: string; points: string; tag: string; gifts: string[]; tone: string; coverImage: string }
type ExchangeCategory = { id: string; emoji: string; label: string }
type ExchangeItem = { id: string; category: string; emoji: string; title: string; description: string; value: number; image: string; displayImage?: string; points: number; redemptionMethod: string }
type ProfileSummary = { stats: { label: string; value: string }[] }
type SavedAddress = { region: string[]; detail: string; contactName: string; contactPhone: string }
type PageResponse<T> = { items: T[]; hasMore: boolean }
type RedemptionResult = { id: string; points: number; isAppVoucher?: boolean; couponCount?: number }

function normalizePage<T>(response: PageResponse<T> | T[]): PageResponse<T> {
  return Array.isArray(response) ? { items: response, hasMore: false } : response
}

function refreshDelay(startedAt: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, Math.max(0, 520 - (Date.now() - startedAt))))
}

function hasCompleteAddress(address: Partial<SavedAddress>) {
  return Boolean(
    address.region &&
    address.region.length === 3 &&
    address.detail &&
    address.detail.trim() &&
    address.contactName &&
    address.contactName.trim() &&
    address.contactPhone &&
    address.contactPhone.trim(),
  )
}

function addressText(address: SavedAddress) {
  return `${address.region.join(' ')} ${address.detail}`
}

Page({
  data: {
    activeMallTab: 'merchants',
    activeMerchant: 0,
    activeExchangeCategory: 0,
    menuButtonTop: 0,
    menuButtonHeight: 0,
    showPackageAnimation: true,
    merchants: [] as Merchant[],
    packages: [] as PackageCard[],
    packagePage: 1,
    packageHasMore: false,
    packageLoading: false,
    packageRefreshing: false,
    packagePullScale: 0,
    exchangeCategories: [] as ExchangeCategory[],
    exchangeItems: [] as ExchangeItem[],
    allExchangeItems: [] as ExchangeItem[],
    showExchangeAnimation: true,
    showAffordableOnly: false,
    exchangePage: 1,
    exchangeHasMore: false,
    exchangeLoading: false,
    exchangeRefreshing: false,
    exchangePullScale: 0,
    userPoints: '--',
    showExchangeDialog: false,
    showShippingDialog: false,
    selectedExchangeItem: null as ExchangeItem | null,
    shippingAddress: null as SavedAddress | null,
    shippingAddressText: '',
    shippingContactText: '',
    showAppVoucherPhoneDialog: false,
    appVoucherRedemptionID: '',
    appVoucherPhone: '',
    claimingAppVoucher: false,
    redeeming: false,
    networkError: false,
  },

  onLoad() {
    const app = getApp<IAppOption>()
    this.setData({ menuButtonTop: app.globalData.menuButtonTop, menuButtonHeight: app.globalData.menuButtonHeight })
    wx.setNavigationBarColor({ frontColor: '#000000', backgroundColor: '#f4f6fb' })
    this.loadMerchants()
    this.loadUserPoints()
    this.loadExchangeCatalog()
  },

  onShow() {
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar) tabBar.setData({ selected: 0 })
    if (wx.getStorageSync('mallActiveTab') === 'exchange') {
      wx.removeStorageSync('mallActiveTab')
      this.setData({ activeMallTab: 'exchange' })
    }
  },

  async loadMerchants() {
    try {
      const merchants = (await request<Merchant[]>('/merchants')).map((item) => ({
        ...item,
        marquee: item.name.length > 5,
        marqueeDuration: Math.max(6, item.name.length * 0.65).toFixed(1),
      }))
      this.setData({ merchants })
      for (let index = 0; index < merchants.length; index += 1) {
        const response = normalizePage(await request<PageResponse<PackageCard> | PackageCard[]>(`/merchants/${merchants[index].id}/packages?page=1&pageSize=10`))
        const packages = await this.loadPackageImages(response.items)
        if (packages.length) {
          this.setData({ activeMerchant: index, packages, packagePage: 1, packageHasMore: response.hasMore, showPackageAnimation: false }, () => {
            wx.nextTick(() => this.setData({ showPackageAnimation: true }))
          })
          return
        }
      }

      this.setData({ activeMerchant: 0, packages: [], packagePage: 1, packageHasMore: false })
    } catch {
      this.setData({ networkError: true })
      wx.showToast({ title: '加载商家失败', icon: 'none' })
    }
  },

  async loadPackages(merchantID: string, page = 1, append = false) {
    if (this.data.packageLoading) return
    this.setData({ packageLoading: true })
    try {
      const response = normalizePage(await request<PageResponse<PackageCard> | PackageCard[]>(`/merchants/${merchantID}/packages?page=${page}&pageSize=10`))
      const packageItems = await this.loadPackageImages(response.items)
      const packages = append ? [...this.data.packages, ...packageItems] : packageItems
      this.setData({ packages, packagePage: page, packageHasMore: response.hasMore, showPackageAnimation: false }, () => wx.nextTick(() => this.setData({ showPackageAnimation: true })))
    } catch {
      if (!append && !this.data.packages.length) this.setData({ networkError: true })
      wx.showToast({ title: '加载套餐失败', icon: 'none' })
    } finally {
      this.setData({ packageLoading: false })
    }
  },

  async loadUserPoints() {
    try {
      const summary = await request<ProfileSummary>('/me/summary')
      const points = summary.stats.find((item) => item.label === '积分')
      const userPoints = points ? points.value : '--'
      this.setData({
        userPoints,
        exchangeItems: this.filterExchangeItems(this.data.allExchangeItems, this.data.showAffordableOnly, userPoints),
      })
    } catch {
      this.setData({
        userPoints: '--',
        exchangeItems: this.filterExchangeItems(this.data.allExchangeItems, this.data.showAffordableOnly, '--'),
      })
    }
  },

  async loadExchangeCatalog() {
    try {
      const exchangeCategories = await request<ExchangeCategory[]>('/points/categories')
      this.setData({ exchangeCategories, activeExchangeCategory: 0 })
      if (exchangeCategories.length) await this.loadExchangeProducts(exchangeCategories[0].id)
    } catch {
      this.setData({ networkError: true })
      wx.showToast({ title: '加载兑换商品失败', icon: 'none' })
    }
  },

  async loadExchangeProducts(categoryID: string, page = 1, append = false) {
    if (this.data.exchangeLoading) return
    this.setData({ exchangeLoading: true })
    try {
      const response = normalizePage(await request<PageResponse<ExchangeItem> | ExchangeItem[]>(`/points/products?category=${encodeURIComponent(categoryID)}&page=${page}&pageSize=10`))
      const displayItems = await this.loadExchangeImages(response.items)
      const exchangeItems = append ? [...this.data.allExchangeItems, ...displayItems] : displayItems
      this.setData({
        allExchangeItems: exchangeItems,
        exchangeItems: this.filterExchangeItems(exchangeItems, this.data.showAffordableOnly, this.data.userPoints),
        exchangePage: page,
        exchangeHasMore: response.hasMore,
        showExchangeAnimation: false,
      }, () => wx.nextTick(() => this.setData({ showExchangeAnimation: true })))
    } catch {
      if (!append && !this.data.exchangeItems.length) this.setData({ networkError: true })
      wx.showToast({ title: '加载兑换商品失败', icon: 'none' })
    } finally {
      this.setData({ exchangeLoading: false })
    }
  },

  async loadPackageImages(packages: PackageCard[]) {
    return Promise.all(packages.map(async (item) => ({ ...item, coverImage: await localImagePath(item.coverImage) })))
  },

  async loadExchangeImages(items: ExchangeItem[]) {
    return Promise.all(items.map(async (item) => ({ ...item, displayImage: await localImagePath(item.image) })))
  },

  retryNetwork() {
    this.setData({ networkError: false })
    this.loadMerchants()
    this.loadUserPoints()
    this.loadExchangeCatalog()
  },

  selectMerchant(event: WechatMiniprogram.TouchEvent) {
    const index = Number(event.currentTarget.dataset.index)
    const merchant = this.data.merchants[index]
    if (!merchant) return
    this.setData({ activeMerchant: index })
    this.loadPackages(merchant.id)
  },

  async refreshPackages() {
    const merchant = this.data.merchants[this.data.activeMerchant]
    if (!merchant) return
    const startedAt = Date.now()
    this.setData({ packageRefreshing: true, packagePullScale: 1 })
    await this.loadPackages(merchant.id)
    await refreshDelay(startedAt)
    this.setData({ packageRefreshing: false, packagePullScale: 0 })
  },

  onPackagePulling(event: WechatMiniprogram.CustomEvent<{ dy: number }>) {
    this.setData({ packagePullScale: Math.min(1, Math.max(0, event.detail.dy) / 90) })
  },

  onPackageRefreshRestore() {
    if (!this.data.packageRefreshing) this.setData({ packagePullScale: 0 })
  },

  loadMorePackages() {
    const merchant = this.data.merchants[this.data.activeMerchant]
    if (!merchant || !this.data.packageHasMore || this.data.packageLoading) return
    this.loadPackages(merchant.id, this.data.packagePage + 1, true)
  },

  selectMallTab(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ activeMallTab: event.detail.value })
  },

  selectExchangeCategory(event: WechatMiniprogram.TouchEvent) {
    const index = Number(event.currentTarget.dataset.index)
    const category = this.data.exchangeCategories[index]
    if (!category) return
    this.setData({ activeExchangeCategory: index })
    this.loadExchangeProducts(category.id)
  },

  async refreshExchangeProducts() {
    const category = this.data.exchangeCategories[this.data.activeExchangeCategory]
    if (!category) return
    const startedAt = Date.now()
    this.setData({ exchangeRefreshing: true, exchangePullScale: 1 })
    await this.loadExchangeProducts(category.id)
    await refreshDelay(startedAt)
    this.setData({ exchangeRefreshing: false, exchangePullScale: 0 })
  },

  onExchangePulling(event: WechatMiniprogram.CustomEvent<{ dy: number }>) {
    this.setData({ exchangePullScale: Math.min(1, Math.max(0, event.detail.dy) / 90) })
  },

  onExchangeRefreshRestore() {
    if (!this.data.exchangeRefreshing) this.setData({ exchangePullScale: 0 })
  },

  loadMoreExchangeProducts() {
    const category = this.data.exchangeCategories[this.data.activeExchangeCategory]
    if (!category || !this.data.exchangeHasMore || this.data.exchangeLoading) return
    this.loadExchangeProducts(category.id, this.data.exchangePage + 1, true)
  },

  filterExchangeItems(items: ExchangeItem[], affordableOnly: boolean, pointsText: string) {
    if (!affordableOnly) return items
    const userPoints = Number(String(pointsText).replace(/[^\d.]/g, '')) || 0
    return items.filter((item) => item.points <= userPoints)
  },

  toggleAffordableOnly(event: WechatMiniprogram.CustomEvent<{ value: boolean }>) {
    const showAffordableOnly = event.detail.value
    this.setData({
      showAffordableOnly,
      exchangeItems: this.filterExchangeItems(this.data.allExchangeItems, showAffordableOnly, this.data.userPoints),
      showExchangeAnimation: false,
    }, () => wx.nextTick(() => this.setData({ showExchangeAnimation: true })))
  },

  async openExchangeDialog(event: WechatMiniprogram.TouchEvent) {
    const index = Number(event.currentTarget.dataset.index)
    const item = this.data.exchangeItems[index]
    if (!item) return
    if (item.redemptionMethod === '快递邮寄') {
      const saved = await this.loadShippingAddress()
      if (!hasCompleteAddress(saved)) {
        wx.showModal({
          title: '请先设置地址',
          content: '邮寄兑换需要填写联系人、联系电话和收货地址。',
          confirmText: '去设置',
          success: (result) => {
            if (result.confirm) wx.navigateTo({ url: '/pages/common-address/common-address' })
          },
        })
        return
      }
      const shippingAddress = saved as SavedAddress
      this.setData({
        selectedExchangeItem: item,
        showExchangeDialog: false,
        showShippingDialog: true,
        shippingAddress,
        shippingAddressText: addressText(shippingAddress),
        shippingContactText: `${shippingAddress.contactName} ${shippingAddress.contactPhone}`,
      })
      return
    }
    this.setData({ selectedExchangeItem: item, showExchangeDialog: true })
  },

  closeExchangeDialog() {
    this.setData({ showExchangeDialog: false })
  },

  closeShippingDialog() {
    this.setData({ showShippingDialog: false })
  },

  closeAppVoucherPhoneDialog() {
    this.setData({ showAppVoucherPhoneDialog: false, appVoucherRedemptionID: '', appVoucherPhone: '' })
  },

  async loadShippingAddress(): Promise<Partial<SavedAddress>> {
    try {
      const saved = await request<SavedAddress | null>('/me/address')
      return saved || {}
    } catch {
      return {}
    }
  },

  preventDialogClose() {},

  editShippingAddress() {
    this.setData({ showShippingDialog: false })
    wx.navigateTo({ url: '/pages/common-address/common-address' })
  },

  confirmShippingExchange() {
    this.redeemSelectedProduct()
  },

  redeemExchange() {
    this.redeemSelectedProduct()
  },

  onAppVoucherPhoneInput(event: WechatMiniprogram.Input) {
    this.setData({ appVoucherPhone: event.detail.value })
  },

  async claimAppVoucher() {
    const phone = this.data.appVoucherPhone.trim()
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }
    if (!this.data.appVoucherRedemptionID || this.data.claimingAppVoucher) return
    this.setData({ claimingAppVoucher: true })
    try {
      await request(`/points/redemptions/${encodeURIComponent(this.data.appVoucherRedemptionID)}/app-voucher`, 'POST', { phone })
      this.closeAppVoucherPhoneDialog()
      wx.showToast({ title: '领取信息已提交', icon: 'success' })
    } catch (error) {
      wx.showToast({ title: error instanceof Error ? error.message : '领取失败', icon: 'none' })
    } finally {
      this.setData({ claimingAppVoucher: false })
    }
  },

  async redeemSelectedProduct() {
    const item = this.data.selectedExchangeItem
    if (!item || this.data.redeeming) return
    this.setData({ redeeming: true })
    try {
      const result = await request<RedemptionResult>(`/points/products/${encodeURIComponent(item.id)}/redeem`, 'POST')
      const userPoints = String(result.points)
      this.setData({
        showExchangeDialog: false,
        showShippingDialog: false,
        selectedExchangeItem: null,
        userPoints,
        exchangeItems: this.filterExchangeItems(this.data.allExchangeItems, this.data.showAffordableOnly, userPoints),
      })
      wx.showToast({ title: '兑换成功', icon: 'success' })
	  if (result.isAppVoucher) {
		wx.showModal({
		  title: '兑换成功',
		  content: '优惠券已到账，是否现在就使用？',
		  cancelText: '稍后使用',
		  confirmText: '现在使用',
		  success: (modal) => {
			if (modal.confirm) this.setData({ showAppVoucherPhoneDialog: true, appVoucherRedemptionID: result.id })
		  },
		})
	  }
    } catch (error) {
      wx.showToast({ title: error instanceof Error ? error.message : '兑换失败', icon: 'none' })
    } finally {
      this.setData({ redeeming: false })
    }
  },

  showPackageDetail(event: WechatMiniprogram.TouchEvent) {
    const id = String(event.currentTarget.dataset.id)
    wx.navigateTo({ url: `/pages/package-detail/package-detail?id=${encodeURIComponent(id)}` })
  },
})
