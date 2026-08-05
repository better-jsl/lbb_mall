"use strict";
// app.ts
App({
    globalData: {
        menuButtonBottom: 0,
        menuButtonTop: 0,
        menuButtonHeight: 0,
    },
    onLaunch() {
        const systemInfo = wx.getSystemInfoSync();
        const menuButton = wx.getMenuButtonBoundingClientRect();
        const statusBarHeight = systemInfo.statusBarHeight || 0;
        const menuButtonTop = menuButton.top || statusBarHeight + 6;
        const menuButtonHeight = menuButton.height || 32;
        this.globalData.menuButtonTop = menuButtonTop;
        this.globalData.menuButtonHeight = menuButtonHeight;
        this.globalData.menuButtonBottom = menuButton.bottom || menuButtonTop + menuButtonHeight;
        // 展示本地存储能力
        const logs = wx.getStorageSync('logs') || [];
        logs.unshift(Date.now());
        wx.setStorageSync('logs', logs);
        // 登录
        wx.login({
            success: res => {
                console.log(res.code);
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
            },
        });
    },
});
