"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("../../api/client");
var local_image_1 = require("../../api/local-image");
function normalizePage(response) {
    return Array.isArray(response) ? { items: response, hasMore: false } : response;
}
function refreshDelay(startedAt) {
    return new Promise(function (resolve) { return setTimeout(resolve, Math.max(0, 520 - (Date.now() - startedAt))); });
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
    onLoad: function () { var app = getApp(); this.setData({ menuButtonTop: app.globalData.menuButtonTop, menuButtonHeight: app.globalData.menuButtonHeight }); this.loadOrders('pending'); },
    onShow: function () { var tabBar = this.getTabBar && this.getTabBar(); if (tabBar)
        tabBar.setData({ selected: 2 }); this.loadOrders(this.data.activeStatus); },
    loadOrders: function (status, page, append) {
        if (page === void 0) { page = 1; }
        if (append === void 0) { append = false; }
        return __awaiter(this, void 0, void 0, function () {
            var response, _a, orderItems, orders, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.data.ordersLoading)
                            return [2 /*return*/];
                        this.setData({ ordersLoading: true });
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, 5, 6]);
                        _a = normalizePage;
                        return [4 /*yield*/, (0, client_1.request)("/orders?status=".concat(status, "&page=").concat(page, "&pageSize=10"))];
                    case 2:
                        response = _a.apply(void 0, [_c.sent()]);
                        return [4 /*yield*/, this.loadOrderImages(response.items)];
                    case 3:
                        orderItems = _c.sent();
                        orders = append ? __spreadArray(__spreadArray([], this.data.orders, true), orderItems, true) : orderItems;
                        this.setData({ orders: orders, orderPage: page, ordersHasMore: response.hasMore, showOrderAnimation: false, networkError: false }, function () { return wx.nextTick(function () { return _this.setData({ showOrderAnimation: true }); }); });
                        return [3 /*break*/, 6];
                    case 4:
                        _b = _c.sent();
                        if (!append && page === 1)
                            this.setData({ networkError: true });
                        wx.showToast({ title: '加载订单失败', icon: 'none' });
                        return [3 /*break*/, 6];
                    case 5:
                        this.setData({ ordersLoading: false });
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
    retryNetwork: function () { this.setData({ networkError: false }); this.loadOrders(this.data.activeStatus); },
    loadOrderImages: function (orders) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.all(orders.map(function (item) { return __awaiter(_this, void 0, void 0, function () {
                        var _a;
                        var _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _a = [__assign({}, item)];
                                    _b = {};
                                    return [4 /*yield*/, (0, local_image_1.localImagePath)(item.image)];
                                case 1: return [2 /*return*/, (__assign.apply(void 0, _a.concat([(_b.image = _c.sent(), _b)])))];
                            }
                        });
                    }); }))];
            });
        });
    },
    selectStatus: function (event) { var activeStatus = event.detail.value; this.setData({ activeStatus: activeStatus }); this.loadOrders(activeStatus); },
    refreshOrders: function () {
        return __awaiter(this, void 0, void 0, function () {
            var startedAt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startedAt = Date.now();
                        this.setData({ ordersRefreshing: true, ordersPullScale: 1 });
                        return [4 /*yield*/, this.loadOrders(this.data.activeStatus)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, refreshDelay(startedAt)];
                    case 2:
                        _a.sent();
                        this.setData({ ordersRefreshing: false, ordersPullScale: 0 });
                        return [2 /*return*/];
                }
            });
        });
    },
    onOrdersPulling: function (event) { this.setData({ ordersPullScale: Math.min(1, Math.max(0, event.detail.dy) / 90) }); },
    onOrdersRefreshRestore: function () { if (!this.data.ordersRefreshing)
        this.setData({ ordersPullScale: 0 }); },
    loadMoreOrders: function () { if (!this.data.ordersHasMore || this.data.ordersLoading)
        return; this.loadOrders(this.data.activeStatus, this.data.orderPage + 1, true); },
    showOrderDetail: function (event) { wx.navigateTo({ url: "/pages/order-detail/order-detail?id=".concat(encodeURIComponent(String(event.currentTarget.dataset.id))) }); },
});
