"use strict";
var allCoupons = [
    { id: 'coupon-1', value: '100', title: '酒吧套餐通用券', note: '满 500 元可用', date: '有效期至 2026-08-31', status: '待使用', state: 'available' },
    { id: 'coupon-2', value: '50', title: '小食拼盘优惠券', note: '满 199 元可用', date: '有效期至 2026-08-20', status: '待使用', state: 'available' },
    { id: 'coupon-3', value: '200', title: '会员专享抵扣券', note: '满 1000 元可用', date: '已于 2026-07-18 使用', status: '已使用', state: 'used' },
    { id: 'coupon-4', value: '80', title: '夜场欢聚优惠券', note: '满 398 元可用', date: '已于 2026-06-30 过期', status: '已过期', state: 'expired' },
];
Page({
    data: {
        menuButtonTop: 0,
        menuButtonHeight: 0,
        activeStatus: 'available',
        coupons: allCoupons.filter(function (item) { return item.state === 'available'; }),
    },
    onLoad: function () {
        var app = getApp();
        this.setData({
            menuButtonTop: app.globalData.menuButtonTop,
            menuButtonHeight: app.globalData.menuButtonHeight,
        });
    },
    selectStatus: function (event) {
        var activeStatus = event.detail.value;
        this.setData({
            activeStatus: activeStatus,
            coupons: allCoupons.filter(function (item) { return item.state === activeStatus; }),
        });
    },
    goBack: function () {
        wx.navigateBack();
    },
});
