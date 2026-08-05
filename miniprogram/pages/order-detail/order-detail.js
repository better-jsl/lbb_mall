"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../../api/client");
Page({
    data: { menuButtonTop: 0, menuButtonHeight: 0, orderID: '', title: '', merchant: '', price: '', priceText: '', status: '', state: '', statusIcon: 'time', statusNote: '', canUsePoints: false, canVerify: false, sectionTitle: '套餐信息', contents: [], orderNo: '', createdAt: '', networkError: false },
    onLoad(options) {
        const app = getApp();
        const id = options.id ? decodeURIComponent(options.id) : '';
        this.setData({ menuButtonTop: app.globalData.menuButtonTop, menuButtonHeight: app.globalData.menuButtonHeight, orderID: id });
        if (id)
            this.loadOrder(id);
    },
    async loadOrder(id) { try {
        this.setData({ ...await (0, client_1.request)(`/orders/${id}`), networkError: false });
    }
    catch {
        this.setData({ networkError: true });
        wx.showToast({ title: '加载订单失败', icon: 'none' });
    } },
    retryNetwork() { if (this.data.orderID) {
        this.setData({ networkError: false });
        this.loadOrder(this.data.orderID);
    } },
    verifyOrder() {
        wx.scanCode({
            scanType: ['qrCode', 'barCode'],
            success: async ({ result }) => {
                try {
                    await (0, client_1.request)('/orders/verify', 'POST', { code: result, orderId: this.data.orderID });
                    wx.showToast({ title: '核销成功', icon: 'success' });
                    if (this.data.orderID)
                        this.loadOrder(this.data.orderID);
                }
                catch {
                    wx.showToast({ title: '核销失败', icon: 'none' });
                }
            },
        });
    },
    openExchange() {
        wx.setStorageSync('mallActiveTab', 'exchange');
        wx.switchTab({ url: '/pages/index/index' });
    },
    goBack() { wx.navigateBack(); },
});
