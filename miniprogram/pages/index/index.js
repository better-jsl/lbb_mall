"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../../api/client");
const local_image_1 = require("../../api/local-image");
function normalizePage(response) {
    return Array.isArray(response) ? { items: response, hasMore: false } : response;
}
function refreshDelay(startedAt) {
    return new Promise((resolve) => setTimeout(resolve, Math.max(0, 520 - (Date.now() - startedAt))));
}
function hasCompleteAddress(address) {
    return Boolean(address.region &&
        address.region.length === 3 &&
        address.detail &&
        address.detail.trim() &&
        address.contactName &&
        address.contactName.trim() &&
        address.contactPhone &&
        address.contactPhone.trim());
}
function addressText(address) {
    return `${address.region.join(' ')} ${address.detail}`;
}
Page({
    data: {
        activeMallTab: 'merchants',
        activeMerchant: 0,
        activeExchangeCategory: 0,
        menuButtonTop: 0,
        menuButtonHeight: 0,
        showPackageAnimation: true,
        merchants: [],
        packages: [],
        packagePage: 1,
        packageHasMore: false,
        packageLoading: false,
        packageRefreshing: false,
        packagePullScale: 0,
        exchangeCategories: [],
        exchangeItems: [],
        allExchangeItems: [],
        showAffordableOnly: false,
        exchangePage: 1,
        exchangeHasMore: false,
        exchangeLoading: false,
        exchangeRefreshing: false,
        exchangePullScale: 0,
        userPoints: '--',
        showExchangeDialog: false,
        showShippingDialog: false,
        selectedExchangeItem: null,
        shippingAddress: null,
        shippingAddressText: '',
        shippingContactText: '',
        redeeming: false,
        networkError: false,
    },
    onLoad() {
        const app = getApp();
        this.setData({ menuButtonTop: app.globalData.menuButtonTop, menuButtonHeight: app.globalData.menuButtonHeight });
        wx.setNavigationBarColor({ frontColor: '#000000', backgroundColor: '#f4f6fb' });
        this.loadMerchants();
        this.loadUserPoints();
        this.loadExchangeCatalog();
    },
    onShow() {
        const tabBar = this.getTabBar && this.getTabBar();
        if (tabBar)
            tabBar.setData({ selected: 0 });
        if (wx.getStorageSync('mallActiveTab') === 'exchange') {
            wx.removeStorageSync('mallActiveTab');
            this.setData({ activeMallTab: 'exchange' });
        }
    },
    async loadMerchants() {
        try {
            const merchants = await (0, client_1.request)('/merchants');
            this.setData({ merchants });
            for (let index = 0; index < merchants.length; index += 1) {
                const response = normalizePage(await (0, client_1.request)(`/merchants/${merchants[index].id}/packages?page=1&pageSize=10`));
                const packages = await this.loadPackageImages(response.items);
                if (packages.length) {
                    this.setData({ activeMerchant: index, packages, packagePage: 1, packageHasMore: response.hasMore, showPackageAnimation: false }, () => {
                        wx.nextTick(() => this.setData({ showPackageAnimation: true }));
                    });
                    return;
                }
            }
            this.setData({ activeMerchant: 0, packages: [], packagePage: 1, packageHasMore: false });
        }
        catch {
            this.setData({ networkError: true });
            wx.showToast({ title: '加载商家失败', icon: 'none' });
        }
    },
    async loadPackages(merchantID, page = 1, append = false) {
        if (this.data.packageLoading)
            return;
        this.setData({ packageLoading: true });
        try {
            const response = normalizePage(await (0, client_1.request)(`/merchants/${merchantID}/packages?page=${page}&pageSize=10`));
            const packageItems = await this.loadPackageImages(response.items);
            const packages = append ? [...this.data.packages, ...packageItems] : packageItems;
            this.setData({ packages, packagePage: page, packageHasMore: response.hasMore, showPackageAnimation: false }, () => wx.nextTick(() => this.setData({ showPackageAnimation: true })));
        }
        catch {
            if (!append && !this.data.packages.length)
                this.setData({ networkError: true });
            wx.showToast({ title: '加载套餐失败', icon: 'none' });
        }
        finally {
            this.setData({ packageLoading: false });
        }
    },
    async loadUserPoints() {
        try {
            const summary = await (0, client_1.request)('/me/summary');
            const points = summary.stats.find((item) => item.label === '积分');
            const userPoints = points ? points.value : '--';
            this.setData({
                userPoints,
                exchangeItems: this.filterExchangeItems(this.data.allExchangeItems, this.data.showAffordableOnly, userPoints),
            });
        }
        catch {
            this.setData({
                userPoints: '--',
                exchangeItems: this.filterExchangeItems(this.data.allExchangeItems, this.data.showAffordableOnly, '--'),
            });
        }
    },
    async loadExchangeCatalog() {
        try {
            const exchangeCategories = await (0, client_1.request)('/points/categories');
            this.setData({ exchangeCategories, activeExchangeCategory: 0 });
            if (exchangeCategories.length)
                await this.loadExchangeProducts(exchangeCategories[0].id);
        }
        catch {
            this.setData({ networkError: true });
            wx.showToast({ title: '加载兑换商品失败', icon: 'none' });
        }
    },
    async loadExchangeProducts(categoryID, page = 1, append = false) {
        if (this.data.exchangeLoading)
            return;
        this.setData({ exchangeLoading: true });
        try {
            const response = normalizePage(await (0, client_1.request)(`/points/products?category=${encodeURIComponent(categoryID)}&page=${page}&pageSize=10`));
            const exchangeItems = append ? [...this.data.allExchangeItems, ...response.items] : response.items;
            this.setData({
                allExchangeItems: exchangeItems,
                exchangeItems: this.filterExchangeItems(exchangeItems, this.data.showAffordableOnly, this.data.userPoints),
                exchangePage: page,
                exchangeHasMore: response.hasMore,
            });
        }
        catch {
            if (!append && !this.data.exchangeItems.length)
                this.setData({ networkError: true });
            wx.showToast({ title: '加载兑换商品失败', icon: 'none' });
        }
        finally {
            this.setData({ exchangeLoading: false });
        }
    },
    async loadPackageImages(packages) {
        return Promise.all(packages.map(async (item) => ({ ...item, coverImage: await (0, local_image_1.localImagePath)(item.coverImage) })));
    },
    retryNetwork() {
        this.setData({ networkError: false });
        this.loadMerchants();
        this.loadUserPoints();
        this.loadExchangeCatalog();
    },
    selectMerchant(event) {
        const index = Number(event.currentTarget.dataset.index);
        const merchant = this.data.merchants[index];
        if (!merchant)
            return;
        this.setData({ activeMerchant: index });
        this.loadPackages(merchant.id);
    },
    async refreshPackages() {
        const merchant = this.data.merchants[this.data.activeMerchant];
        if (!merchant)
            return;
        const startedAt = Date.now();
        this.setData({ packageRefreshing: true, packagePullScale: 1 });
        await this.loadPackages(merchant.id);
        await refreshDelay(startedAt);
        this.setData({ packageRefreshing: false, packagePullScale: 0 });
    },
    onPackagePulling(event) {
        this.setData({ packagePullScale: Math.min(1, Math.max(0, event.detail.dy) / 90) });
    },
    onPackageRefreshRestore() {
        if (!this.data.packageRefreshing)
            this.setData({ packagePullScale: 0 });
    },
    loadMorePackages() {
        const merchant = this.data.merchants[this.data.activeMerchant];
        if (!merchant || !this.data.packageHasMore || this.data.packageLoading)
            return;
        this.loadPackages(merchant.id, this.data.packagePage + 1, true);
    },
    selectMallTab(event) {
        this.setData({ activeMallTab: event.detail.value });
    },
    selectExchangeCategory(event) {
        const index = Number(event.currentTarget.dataset.index);
        const category = this.data.exchangeCategories[index];
        if (!category)
            return;
        this.setData({ activeExchangeCategory: index });
        this.loadExchangeProducts(category.id);
    },
    async refreshExchangeProducts() {
        const category = this.data.exchangeCategories[this.data.activeExchangeCategory];
        if (!category)
            return;
        const startedAt = Date.now();
        this.setData({ exchangeRefreshing: true, exchangePullScale: 1 });
        await this.loadExchangeProducts(category.id);
        await refreshDelay(startedAt);
        this.setData({ exchangeRefreshing: false, exchangePullScale: 0 });
    },
    onExchangePulling(event) {
        this.setData({ exchangePullScale: Math.min(1, Math.max(0, event.detail.dy) / 90) });
    },
    onExchangeRefreshRestore() {
        if (!this.data.exchangeRefreshing)
            this.setData({ exchangePullScale: 0 });
    },
    loadMoreExchangeProducts() {
        const category = this.data.exchangeCategories[this.data.activeExchangeCategory];
        if (!category || !this.data.exchangeHasMore || this.data.exchangeLoading)
            return;
        this.loadExchangeProducts(category.id, this.data.exchangePage + 1, true);
    },
    filterExchangeItems(items, affordableOnly, pointsText) {
        if (!affordableOnly)
            return items;
        const userPoints = Number(String(pointsText).replace(/[^\d.]/g, '')) || 0;
        return items.filter((item) => item.points <= userPoints);
    },
    toggleAffordableOnly(event) {
        const showAffordableOnly = event.detail.value;
        this.setData({
            showAffordableOnly,
            exchangeItems: this.filterExchangeItems(this.data.allExchangeItems, showAffordableOnly, this.data.userPoints),
        });
    },
    async openExchangeDialog(event) {
        const index = Number(event.currentTarget.dataset.index);
        const item = this.data.exchangeItems[index];
        if (!item)
            return;
        if (item.redemptionMethod === '快递邮寄') {
            const saved = await this.loadShippingAddress();
            if (!hasCompleteAddress(saved)) {
                wx.showModal({
                    title: '请先设置地址',
                    content: '邮寄兑换需要填写联系人、联系电话和收货地址。',
                    confirmText: '去设置',
                    success: (result) => {
                        if (result.confirm)
                            wx.navigateTo({ url: '/pages/common-address/common-address' });
                    },
                });
                return;
            }
            const shippingAddress = saved;
            this.setData({
                selectedExchangeItem: item,
                showExchangeDialog: false,
                showShippingDialog: true,
                shippingAddress,
                shippingAddressText: addressText(shippingAddress),
                shippingContactText: `${shippingAddress.contactName} ${shippingAddress.contactPhone}`,
            });
            return;
        }
        this.setData({ selectedExchangeItem: item, showExchangeDialog: true });
    },
    closeExchangeDialog() {
        this.setData({ showExchangeDialog: false });
    },
    closeShippingDialog() {
        this.setData({ showShippingDialog: false });
    },
    async loadShippingAddress() {
        try {
            const saved = await (0, client_1.request)('/me/address');
            return saved || {};
        }
        catch {
            return {};
        }
    },
    preventDialogClose() { },
    editShippingAddress() {
        this.setData({ showShippingDialog: false });
        wx.navigateTo({ url: '/pages/common-address/common-address' });
    },
    confirmShippingExchange() {
        this.redeemSelectedProduct();
    },
    redeemExchange() {
        this.redeemSelectedProduct();
    },
    async redeemSelectedProduct() {
        const item = this.data.selectedExchangeItem;
        if (!item || this.data.redeeming)
            return;
        this.setData({ redeeming: true });
        try {
            const result = await (0, client_1.request)(`/points/products/${encodeURIComponent(item.id)}/redeem`, 'POST');
            const userPoints = String(result.points);
            this.setData({
                showExchangeDialog: false,
                showShippingDialog: false,
                selectedExchangeItem: null,
                userPoints,
                exchangeItems: this.filterExchangeItems(this.data.allExchangeItems, this.data.showAffordableOnly, userPoints),
            });
            wx.showToast({ title: '兑换成功', icon: 'success' });
        }
        catch (error) {
            wx.showToast({ title: error instanceof Error ? error.message : '兑换失败', icon: 'none' });
        }
        finally {
            this.setData({ redeeming: false });
        }
    },
    showPackageDetail(event) {
        const id = String(event.currentTarget.dataset.id);
        wx.navigateTo({ url: `/pages/package-detail/package-detail?id=${encodeURIComponent(id)}` });
    },
});
