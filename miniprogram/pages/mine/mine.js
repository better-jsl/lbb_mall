"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../../api/client");
Page({
    data: {
        menuButtonTop: 0,
        menuButtonHeight: 0,
        menuButtonBottom: 0,
        addressSummary: '',
        nickname: '',
        stats: [],
        networkError: false,
        entries: [
            { icon: 'location', label: '地址设置', route: 'address' },
            { icon: 'file-paste', label: '我的订单', route: 'orders' },
        ],
    },
    onLoad() {
        const app = getApp();
        this.setData({ menuButtonTop: app.globalData.menuButtonTop, menuButtonHeight: app.globalData.menuButtonHeight, menuButtonBottom: app.globalData.menuButtonBottom });
    },
    onShow() { const tabBar = this.getTabBar && this.getTabBar(); if (tabBar)
        tabBar.setData({ selected: 3 }); this.loadSummary(); this.loadAddressSummary(); },
    async loadSummary() { try {
        const summary = await (0, client_1.request)('/me/summary');
        this.setData({ stats: summary.stats, nickname: summary.profile.nickname, networkError: false });
    }
    catch {
        this.setData({ networkError: true });
        wx.showToast({ title: '加载个人信息失败', icon: 'none' });
    } },
    retryNetwork() { this.setData({ networkError: false }); this.loadSummary(); this.loadAddressSummary(); },
    goVerification() {
        wx.scanCode({ scanType: ['qrCode', 'barCode'], success: async ({ result }) => {
                try {
                    await (0, client_1.request)('/orders/verify', 'POST', { code: result });
                    wx.showToast({ title: '核销成功', icon: 'success' });
                    this.loadSummary();
                }
                catch {
                    wx.showToast({ title: '核销失败', icon: 'none' });
                }
            } });
    },
    openStat(event) { const index = Number(event.currentTarget.dataset.index); const url = index === 0 ? '/pages/points-record/points-record' : index === 1 ? '/pages/coupons/coupons' : ''; if (url)
        wx.navigateTo({ url }); },
    async loadAddressSummary() {
        try {
            const saved = await (0, client_1.request)('/me/address');
            this.setData({ addressSummary: saved ? saved.region.join(' ') : '' });
        }
        catch {
            this.setData({ addressSummary: '' });
        }
    },
    openEntry(event) {
        const route = String(event.currentTarget.dataset.route);
        if (route === 'address')
            wx.navigateTo({ url: '/pages/common-address/common-address' });
        if (route === 'orders')
            wx.switchTab({ url: '/pages/orders/orders' });
    },
});
