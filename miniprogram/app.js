"use strict";
// app.ts
App({
    globalData: {
        menuButtonBottom: 0,
        menuButtonTop: 0,
        menuButtonHeight: 0,
    },
    onLaunch: function () {
        var systemInfo = wx.getSystemInfoSync();
        var menuButton = wx.getMenuButtonBoundingClientRect();
        var statusBarHeight = systemInfo.statusBarHeight || 0;
        var menuButtonTop = menuButton.top || statusBarHeight + 6;
        var menuButtonHeight = menuButton.height || 32;
        this.globalData.menuButtonTop = menuButtonTop;
        this.globalData.menuButtonHeight = menuButtonHeight;
        this.globalData.menuButtonBottom = menuButton.bottom || menuButtonTop + menuButtonHeight;
        // 展示本地存储能力
        var logs = wx.getStorageSync('logs') || [];
        logs.unshift(Date.now());
        wx.setStorageSync('logs', logs);
        // 登录
        wx.login({
            success: function (res) {
                console.log(res.code);
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
            },
        });
    },
});
