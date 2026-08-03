"use strict";
var records = [
    { id: 'point-1', title: '名仕洋酒套餐赠送', time: '2026-08-03 15:20', change: 1264 },
    { id: 'point-2', title: '商城兑换优惠券', time: '2026-07-28 20:12', change: -200 },
    { id: 'point-3', title: '订单核销返积分', time: '2026-07-12 22:06', change: 96 },
    { id: 'point-4', title: '商城兑换小食', time: '2026-06-30 19:40', change: -80 },
];
Page({
    data: {
        menuButtonTop: 0,
        menuButtonHeight: 0,
        records: records,
    },
    onLoad: function () {
        var app = getApp();
        this.setData({
            menuButtonTop: app.globalData.menuButtonTop,
            menuButtonHeight: app.globalData.menuButtonHeight,
        });
    },
    goBack: function () {
        wx.navigateBack();
    },
});
