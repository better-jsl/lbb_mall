"use strict";
Component({
    data: {
        selected: 0,
        tabs: [
            {
                pagePath: 'pages/index/index',
                text: '商城',
                icon: { name: 'home-filled', size: 26 },
            },
            {
                pagePath: 'pages/benefits/benefits',
                text: '福利',
                icon: { name: 'gift-filled', size: 26 },
            },
            {
                pagePath: 'pages/orders/orders',
                text: '订单',
                icon: { name: 'bill-filled', size: 26 },
            },
            {
                pagePath: 'pages/mine/mine',
                text: '我的',
                icon: { name: 'user-filled', size: 26 },
            },
        ],
    },
    lifetimes: {
        attached() {
            this.updateSelected();
        },
    },
    pageLifetimes: {
        show() {
            this.updateSelected();
        },
    },
    methods: {
        updateSelected() {
            const pages = getCurrentPages();
            const currentPage = pages[pages.length - 1];
            const currentRoute = currentPage ? currentPage.route : '';
            const selected = this.data.tabs.findIndex((item) => item.pagePath === currentRoute);
            if (selected >= 0) {
                this.setData({ selected });
            }
        },
        onTabChange(event) {
            const index = Number(event.detail.value);
            const tab = this.data.tabs[index];
            if (!tab) {
                return;
            }
            this.setData({ selected: index });
            wx.switchTab({ url: `/${tab.pagePath}` });
        },
    },
});
