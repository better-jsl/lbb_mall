"use strict";
var allOrders = [
    { id: 'order-1', title: '名仕洋酒套餐', merchant: '梦田', price: '1,580', status: '待核销', state: 'pending' },
    { id: 'order-2', title: '喜力啤酒套餐', merchant: '柏林之声', price: '498', status: '待核销', state: 'pending' },
    { id: 'order-3', title: '百威小酌套餐', merchant: '欢乐迪', price: '39.9', status: '已核销', state: 'verified' },
    { id: 'order-4', title: '野格欢喜套餐', merchant: '欢唱', price: '298', status: '已失效', state: 'expired' },
];
Page({
    data: {
        menuButtonTop: 0,
        menuButtonHeight: 0,
        activeStatus: 'pending',
        showOrderAnimation: true,
        orders: allOrders.filter(function (item) { return item.state === 'pending'; }),
    },
    onLoad: function () {
        var app = getApp();
        this.setData({
            menuButtonTop: app.globalData.menuButtonTop,
            menuButtonHeight: app.globalData.menuButtonHeight,
        });
    },
    onShow: function () {
        var tabBar = this.getTabBar && this.getTabBar();
        if (tabBar) {
            tabBar.setData({ selected: 1 });
        }
    },
    selectStatus: function (event) {
        var _this = this;
        var activeStatus = event.detail.value;
        this.setData({
            activeStatus: activeStatus,
            orders: allOrders.filter(function (item) { return item.state === activeStatus; }),
            showOrderAnimation: false,
        }, function () {
            wx.nextTick(function () { return _this.setData({ showOrderAnimation: true }); });
        });
    },
    showOrderDetail: function (event) {
        var _a = event.currentTarget.dataset, title = _a.title, merchant = _a.merchant, price = _a.price, status = _a.status;
        wx.navigateTo({
            url: "/pages/order-detail/order-detail?title=".concat(encodeURIComponent(String(title)), "&merchant=").concat(encodeURIComponent(String(merchant)), "&price=").concat(encodeURIComponent(String(price)), "&status=").concat(encodeURIComponent(String(status))),
        });
    },
});
