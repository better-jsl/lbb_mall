"use strict";
Page({
    data: {
        menuButtonBottom: 0,
        stats: [
            { label: '积分', value: '1264' },
            { label: '优惠券', value: '3' },
            { label: '收藏', value: '8' },
        ],
        entries: [
            { icon: 'location', label: '常用地址' },
        ],
    },
    onLoad: function () {
        var app = getApp();
        this.setData({
            menuButtonBottom: app.globalData.menuButtonBottom,
        });
    },
    onShow: function () {
        var tabBar = this.getTabBar && this.getTabBar();
        if (tabBar) {
            tabBar.setData({ selected: 2 });
        }
    },
    goVerification: function () {
        wx.scanCode({
            scanType: ['qrCode', 'barCode'],
        });
    },
    openStat: function (event) {
        var index = Number(event.currentTarget.dataset.index);
        var url = index === 0 ? '/pages/points-record/points-record' : index === 1 ? '/pages/coupons/coupons' : '';
        if (url) {
            wx.navigateTo({ url: url });
        }
    },
});
