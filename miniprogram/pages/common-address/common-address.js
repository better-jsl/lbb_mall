"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../../api/client");
Page({
    data: { menuButtonTop: 0, menuButtonHeight: 0, contactName: '', contactPhone: '', region: [], regionText: '', detailAddress: '', networkError: false },
    onLoad() {
        const app = getApp();
        this.setData({ menuButtonTop: app.globalData.menuButtonTop, menuButtonHeight: app.globalData.menuButtonHeight });
        wx.setNavigationBarColor({ frontColor: '#000000', backgroundColor: '#f4f6fb' });
        this.loadAddress();
    },
    async loadAddress() {
        try {
            const saved = await (0, client_1.request)('/me/address');
            if (!saved) {
                this.setData({ networkError: false });
                return;
            }
            this.setData({
                contactName: saved.contactName,
                contactPhone: saved.contactPhone,
                region: saved.region,
                regionText: saved.region.join(' '),
                detailAddress: saved.detail,
                networkError: false,
            });
        }
        catch {
            this.setData({ networkError: true });
            wx.showToast({ title: '地址加载失败', icon: 'none' });
        }
    },
    retryNetwork() { this.setData({ networkError: false }); this.loadAddress(); },
    onRegionChange(event) {
        const region = event.detail.value || [];
        this.setData({ region, regionText: region.join(' ') });
    },
    onContactNameInput(event) { this.setData({ contactName: event.detail.value }); },
    onContactPhoneInput(event) { this.setData({ contactPhone: event.detail.value }); },
    onDetailInput(event) { this.setData({ detailAddress: event.detail.value }); },
    async saveAddress() {
        const contactName = this.data.contactName.trim();
        const contactPhone = this.data.contactPhone.trim();
        const detailAddress = this.data.detailAddress.trim();
        if (!contactName) {
            wx.showToast({ title: '请填写联系人', icon: 'none' });
            return;
        }
        if (!contactPhone) {
            wx.showToast({ title: '请填写联系人电话', icon: 'none' });
            return;
        }
        if (this.data.region.length !== 3 || !detailAddress) {
            wx.showToast({ title: '请完善地址信息', icon: 'none' });
            return;
        }
        try {
            const saved = await (0, client_1.request)('/me/address', 'PUT', {
                region: this.data.region,
                detail: detailAddress,
                contactName,
                contactPhone,
            });
            this.setData({ region: saved.region, regionText: saved.region.join(' '), detailAddress: saved.detail, contactName: saved.contactName, contactPhone: saved.contactPhone });
            wx.showToast({ title: '地址已保存', icon: 'success' });
        }
        catch {
            wx.showToast({ title: '地址保存失败', icon: 'none' });
        }
    },
    goBack() { wx.navigateBack(); },
});
