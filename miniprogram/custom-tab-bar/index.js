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
        attached: function () {
            this.updateSelected();
        },
    },
    pageLifetimes: {
        show: function () {
            this.updateSelected();
        },
    },
    methods: {
        updateSelected: function () {
            var pages = getCurrentPages();
            var currentPage = pages[pages.length - 1];
            var currentRoute = currentPage ? currentPage.route : '';
            var selected = this.data.tabs.findIndex(function (item) { return item.pagePath === currentRoute; });
            if (selected >= 0) {
                this.setData({ selected: selected });
            }
        },
        onTabChange: function (event) {
            var index = Number(event.detail.value);
            var tab = this.data.tabs[index];
            if (!tab) {
                return;
            }
            this.setData({ selected: index });
            wx.switchTab({ url: "/".concat(tab.pagePath) });
        },
    },
});
