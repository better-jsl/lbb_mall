"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../../api/client");
Page({
    data: { menuButtonTop: 0, menuButtonHeight: 0, activeStatus: 'available', coupons: [], networkError: false },
    onLoad() { const app = getApp(); this.setData({ menuButtonTop: app.globalData.menuButtonTop, menuButtonHeight: app.globalData.menuButtonHeight }); this.loadCoupons('available'); },
    async loadCoupons(status) { try {
        this.setData({ coupons: await (0, client_1.request)(`/coupons?status=${status}`), networkError: false });
    }
    catch {
        this.setData({ networkError: true });
        wx.showToast({ title: '加载优惠券失败', icon: 'none' });
    } },
    retryNetwork() { this.setData({ networkError: false }); this.loadCoupons(this.data.activeStatus); },
    selectStatus(event) { const activeStatus = event.detail.value; this.setData({ activeStatus }); this.loadCoupons(activeStatus); },
    goBack() { wx.navigateBack(); },
});
