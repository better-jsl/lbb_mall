"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../../api/client");
const local_image_1 = require("../../api/local-image");
Page({
    data: {
        menuButtonBottom: 0, menuButtonTop: 0, menuButtonHeight: 0, navOpacity: 0, activeBanner: 0,
        packageID: '', bannerImages: [],
        title: '', price: '', points: '', contents: [], notices: [],
        networkError: false,
    },
    onLoad(options) {
        const app = getApp();
        const packageID = options.id ? decodeURIComponent(options.id) : '';
        this.setData({ menuButtonBottom: app.globalData.menuButtonBottom, menuButtonTop: app.globalData.menuButtonTop, menuButtonHeight: app.globalData.menuButtonHeight, packageID });
        if (packageID)
            this.loadPackage(packageID);
    },
    async loadPackage(packageID) {
        try {
            const detail = await (0, client_1.request)(`/packages/${packageID}`);
            const bannerImages = await (0, local_image_1.localImagePaths)(detail.images.length ? detail.images : detail.coverImage ? [detail.coverImage] : []);
            this.setData({ ...detail, bannerImages, activeBanner: 0, networkError: false });
        }
        catch {
            this.setData({ networkError: true });
            wx.showToast({ title: '加载套餐失败', icon: 'none' });
        }
    },
    retryNetwork() { if (this.data.packageID) {
        this.setData({ networkError: false });
        this.loadPackage(this.data.packageID);
    } },
    onScroll(event) { const navOpacity = Math.min(event.detail.scrollTop / 160, 1); if (Math.abs(this.data.navOpacity - navOpacity) > 0.01)
        this.setData({ navOpacity }); },
    onBannerChange(event) { this.setData({ activeBanner: event.detail.current }); },
    previewBanner(event) { wx.previewImage({ current: String(event.currentTarget.dataset.current), urls: this.data.bannerImages }); },
    goBack() { wx.navigateBack(); },
    async buyNow() {
        try {
            await (0, client_1.request)('/orders', 'POST', { packageId: this.data.packageID });
            wx.showToast({ title: '下单成功', icon: 'success' });
        }
        catch {
            wx.showToast({ title: '下单失败', icon: 'none' });
        }
    },
});
