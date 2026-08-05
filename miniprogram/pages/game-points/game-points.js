"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../../api/client");
Page({
    data: {
        menuButtonTop: 0,
        menuButtonHeight: 0,
        games: [],
        playing: false,
        networkError: false,
    },
    onLoad() {
        const app = getApp();
        this.setData({ menuButtonTop: app.globalData.menuButtonTop, menuButtonHeight: app.globalData.menuButtonHeight });
        wx.setNavigationBarColor({ frontColor: '#000000', backgroundColor: '#ffffff' });
    },
    onShow() {
        this.loadGames();
    },
    async loadGames() {
        try {
            this.setData({ games: await (0, client_1.request)('/games'), networkError: false });
        }
        catch {
            this.setData({ networkError: true });
            wx.showToast({ title: '加载游戏失败', icon: 'none' });
        }
    },
    retryNetwork() { this.setData({ networkError: false }); this.loadGames(); },
    async chooseGame(event) {
        const id = String(event.currentTarget.dataset.id);
        if (!id || this.data.playing)
            return;
        this.setData({ playing: true });
        try {
            const result = await (0, client_1.request)(`/games/${encodeURIComponent(id)}/play`, 'POST');
            await this.loadGames();
            wx.showToast({ title: `获得${result.reward}积分`, icon: 'success' });
        }
        catch (error) {
            wx.showToast({ title: error instanceof Error ? error.message : '游戏开始失败', icon: 'none' });
        }
        finally {
            this.setData({ playing: false });
        }
    },
    goBack() { wx.navigateBack(); },
});
