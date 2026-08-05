"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../../api/client");
function refreshDelay(startedAt) {
    return new Promise((resolve) => setTimeout(resolve, Math.max(0, 520 - (Date.now() - startedAt))));
}
Page({
    data: {
        menuButtonTop: 0,
        menuButtonHeight: 0,
        userPoints: '--',
        leaderboard: [],
        benefitItems: [],
        promoCards: [],
        noticeItems: [],
        enterpriseDialog: null,
        enterpriseDialogVisible: false,
        benefitsRefreshing: false,
        benefitsPullScale: 0,
        networkError: false,
    },
    onLoad() {
        const app = getApp();
        this.setData({ menuButtonTop: app.globalData.menuButtonTop, menuButtonHeight: app.globalData.menuButtonHeight });
        wx.setNavigationBarColor({ frontColor: '#000000', backgroundColor: '#f4f6fb' });
        this.loadBenefits();
    },
    onShow() {
        const tabBar = this.getTabBar && this.getTabBar();
        if (tabBar)
            tabBar.setData({ selected: 1 });
        this.loadUserPoints();
        this.loadLeaderboard();
    },
    async refreshBenefits() {
        const startedAt = Date.now();
        this.setData({ benefitsRefreshing: true, benefitsPullScale: 1 });
        await Promise.all([this.loadUserPoints(), this.loadLeaderboard()]);
        await refreshDelay(startedAt);
        this.setData({ benefitsRefreshing: false, benefitsPullScale: 0 });
    },
    onBenefitsPulling(event) {
        this.setData({ benefitsPullScale: Math.min(1, Math.max(0, event.detail.dy) / 90) });
    },
    onBenefitsRefreshRestore() {
        if (!this.data.benefitsRefreshing)
            this.setData({ benefitsPullScale: 0 });
    },
    openBenefit(event) {
        const id = event.currentTarget.dataset.id;
        if (id === 'enterprise') {
            this.setData({ enterpriseDialogVisible: true });
            return;
        }
        if (id === 'game') {
            wx.navigateTo({ url: '/pages/game-points/game-points' });
            return;
        }
        if (id === 'daily') {
            wx.navigateTo({ url: '/pages/daily-tasks/daily-tasks' });
            return;
        }
        wx.showToast({ title: '功能即将上线', icon: 'none' });
    },
    async loadUserPoints() {
        try {
            const summary = await (0, client_1.request)('/me/summary');
            const points = summary.stats.find((item) => item.label === '积分');
            this.setData({ userPoints: points ? points.value : '--' });
        }
        catch {
            this.setData({ userPoints: '--' });
            this.setData({ networkError: true });
        }
    },
    async loadBenefits() {
        try {
            const payload = await (0, client_1.request)('/benefits');
            this.setData({ benefitItems: payload.items, noticeItems: payload.notices, promoCards: payload.promos, enterpriseDialog: payload.enterpriseDialog });
        }
        catch {
            this.setData({ networkError: true });
            wx.showToast({ title: '加载福利内容失败', icon: 'none' });
        }
    },
    async loadLeaderboard() {
        try {
            const items = await (0, client_1.request)('/points/leaderboard');
            const topFive = items.filter((item) => item.rank <= 5);
            const current = items.find((item) => item.isCurrent);
            const visibleItems = current && current.rank > 5
                ? [...topFive.slice(0, 3), { rank: -1, nickname: '', initial: '', points: 0, isCurrent: false, isEllipsis: true }, current]
                : topFive;
            const leaderboard = visibleItems.map((item) => ({ ...item, key: item.isEllipsis ? 'ellipsis' : `rank-${item.rank}` }));
            this.setData({ leaderboard });
        }
        catch {
            this.setData({ leaderboard: [], networkError: true });
        }
    },
    retryNetwork() {
        this.setData({ networkError: false });
        this.loadBenefits();
        this.loadUserPoints();
        this.loadLeaderboard();
    },
    closeEnterpriseDialog() {
        this.setData({ enterpriseDialogVisible: false });
    },
    preventDialogClose() { },
});
