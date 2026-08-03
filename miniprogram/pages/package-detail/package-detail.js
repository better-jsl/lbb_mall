"use strict";
Page({
    data: {
        menuButtonBottom: 0,
        menuButtonTop: 0,
        menuButtonHeight: 0,
        navOpacity: 0,
        activeBanner: 0,
        bannerImages: [
            '/assets/package-banner.jpg',
            '/assets/package-banner-2.jpg',
            '/assets/package-banner-3.jpg',
        ],
        title: '名仕洋酒套餐',
        price: '1580',
        points: '1264',
        contents: [
            { name: '名仕洋酒', count: '1 瓶' },
            { name: '精选果盘', count: '1 份' },
            { name: '小吃拼盘', count: '1 份' },
        ],
        notices: [
            '本套餐仅限下单门店使用，不可跨店兑换。',
            '下单后请在有效期内预约到店，逾期自动失效。',
            '未成年人禁止购买及饮用酒类商品。',
        ],
    },
    onLoad: function (options) {
        var app = getApp();
        this.setData({
            menuButtonBottom: app.globalData.menuButtonBottom,
            menuButtonTop: app.globalData.menuButtonTop,
            menuButtonHeight: app.globalData.menuButtonHeight,
            title: options.title ? decodeURIComponent(options.title) : this.data.title,
            price: options.price ? decodeURIComponent(options.price) : this.data.price,
            points: options.points ? decodeURIComponent(options.points) : this.data.points,
        });
    },
    onScroll: function (event) {
        var navOpacity = Math.min(event.detail.scrollTop / 160, 1);
        if (Math.abs(this.data.navOpacity - navOpacity) > 0.01) {
            this.setData({ navOpacity: navOpacity });
        }
    },
    onBannerChange: function (event) {
        this.setData({ activeBanner: event.detail.current });
    },
    previewBanner: function (event) {
        wx.previewImage({
            current: String(event.currentTarget.dataset.current),
            urls: this.data.bannerImages,
        });
    },
    goBack: function () {
        wx.navigateBack();
    },
    buyNow: function () {
        wx.showToast({
            title: '购买功能待接入',
            icon: 'none',
        });
    },
});
