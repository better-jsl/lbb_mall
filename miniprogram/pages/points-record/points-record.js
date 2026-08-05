"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../../api/client");
Page({
    data: { menuButtonTop: 0, menuButtonHeight: 0, records: [], networkError: false },
    onLoad() { const app = getApp(); this.setData({ menuButtonTop: app.globalData.menuButtonTop, menuButtonHeight: app.globalData.menuButtonHeight }); this.loadRecords(); },
    async loadRecords() { try {
        this.setData({ records: await (0, client_1.request)('/points/records'), networkError: false });
    }
    catch {
        this.setData({ networkError: true });
        wx.showToast({ title: '加载积分记录失败', icon: 'none' });
    } },
    retryNetwork() { this.setData({ networkError: false }); this.loadRecords(); },
    goBack() { wx.navigateBack(); },
});
