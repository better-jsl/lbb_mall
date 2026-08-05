"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../../api/client");
const local_image_1 = require("../../api/local-image");
function normalizePage(response) {
    return Array.isArray(response) ? { items: response, hasMore: false } : response;
}
function refreshDelay(startedAt) {
    return new Promise((resolve) => setTimeout(resolve, Math.max(0, 520 - (Date.now() - startedAt))));
}
Page({
    data: {
        menuButtonTop: 0,
        menuButtonHeight: 0,
        activeStatus: 'pending',
        showOrderAnimation: true,
        orders: [],
        orderPage: 1,
        ordersHasMore: false,
        ordersLoading: false,
        ordersRefreshing: false,
        ordersPullScale: 0,
        networkError: false,
    },
    onLoad() { const app = getApp(); this.setData({ menuButtonTop: app.globalData.menuButtonTop, menuButtonHeight: app.globalData.menuButtonHeight }); this.loadOrders('pending'); },
    onShow() { const tabBar = this.getTabBar && this.getTabBar(); if (tabBar)
        tabBar.setData({ selected: 2 }); this.loadOrders(this.data.activeStatus); },
    async loadOrders(status, page = 1, append = false) {
        if (this.data.ordersLoading)
            return;
        this.setData({ ordersLoading: true });
        try {
            const response = normalizePage(await (0, client_1.request)(`/orders?status=${status}&page=${page}&pageSize=10`));
            const orderItems = await this.loadOrderImages(response.items);
            const orders = append ? [...this.data.orders, ...orderItems] : orderItems;
            this.setData({ orders, orderPage: page, ordersHasMore: response.hasMore, showOrderAnimation: false, networkError: false }, () => wx.nextTick(() => this.setData({ showOrderAnimation: true })));
        }
        catch {
            if (!append && page === 1)
                this.setData({ networkError: true });
            wx.showToast({ title: '加载订单失败', icon: 'none' });
        }
        finally {
            this.setData({ ordersLoading: false });
        }
    },
    retryNetwork() { this.setData({ networkError: false }); this.loadOrders(this.data.activeStatus); },
    async loadOrderImages(orders) { return Promise.all(orders.map(async (item) => ({ ...item, image: await (0, local_image_1.localImagePath)(item.image) }))); },
    selectStatus(event) { const activeStatus = event.detail.value; this.setData({ activeStatus }); this.loadOrders(activeStatus); },
    async refreshOrders() {
        const startedAt = Date.now();
        this.setData({ ordersRefreshing: true, ordersPullScale: 1 });
        await this.loadOrders(this.data.activeStatus);
        await refreshDelay(startedAt);
        this.setData({ ordersRefreshing: false, ordersPullScale: 0 });
    },
    onOrdersPulling(event) { this.setData({ ordersPullScale: Math.min(1, Math.max(0, event.detail.dy) / 90) }); },
    onOrdersRefreshRestore() { if (!this.data.ordersRefreshing)
        this.setData({ ordersPullScale: 0 }); },
    loadMoreOrders() { if (!this.data.ordersHasMore || this.data.ordersLoading)
        return; this.loadOrders(this.data.activeStatus, this.data.orderPage + 1, true); },
    showOrderDetail(event) { wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${encodeURIComponent(String(event.currentTarget.dataset.id))}` }); },
});
