"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("../../api/client");
var local_image_1 = require("../../api/local-image");
Page({
    data: {
        menuButtonTop: 0,
        menuButtonHeight: 0,
        menuButtonBottom: 0,
        addressSummary: '',
        nickname: '',
        avatar: '',
        stats: [],
        networkError: false,
        entries: [
            { icon: 'location', label: '地址设置', route: 'address' },
            { icon: 'file-paste', label: '我的订单', route: 'orders' },
        ],
    },
    onLoad: function () {
        var app = getApp();
        this.setData({ menuButtonTop: app.globalData.menuButtonTop, menuButtonHeight: app.globalData.menuButtonHeight, menuButtonBottom: app.globalData.menuButtonBottom });
    },
    onShow: function () { var tabBar = this.getTabBar && this.getTabBar(); if (tabBar)
        tabBar.setData({ selected: 3 }); this.loadSummary(); this.loadAddressSummary(); },
    loadSummary: function () {
        return __awaiter(this, void 0, void 0, function () { var summary, avatar, _a; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, client_1.request)('/me/summary')];
                case 1:
                    summary = _b.sent();
                    return [4 /*yield*/, (0, local_image_1.localImagePath)(summary.profile.avatar)];
                case 2:
                    avatar = _b.sent();
                    this.setData({ stats: summary.stats, nickname: summary.profile.nickname, avatar: avatar, networkError: false });
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    this.setData({ networkError: true });
                    wx.showToast({ title: '加载个人信息失败', icon: 'none' });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        }); });
    },
    retryNetwork: function () { this.setData({ networkError: false }); this.loadSummary(); this.loadAddressSummary(); },
    goVerification: function () {
        var _this = this;
        wx.scanCode({ scanType: ['qrCode', 'barCode'], success: function (_a) {
                var result = _a.result;
                return __awaiter(_this, void 0, void 0, function () {
                    var _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _c.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, (0, client_1.request)('/orders/verify', 'POST', { code: result })];
                            case 1:
                                _c.sent();
                                wx.showToast({ title: '核销成功', icon: 'success' });
                                this.loadSummary();
                                return [3 /*break*/, 3];
                            case 2:
                                _b = _c.sent();
                                wx.showToast({ title: '核销失败', icon: 'none' });
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                });
            } });
    },
    openStat: function (event) { var index = Number(event.currentTarget.dataset.index); var url = index === 0 ? '/pages/points-record/points-record' : index === 1 ? '/pages/coupons/coupons' : ''; if (url)
        wx.navigateTo({ url: url }); },
    loadAddressSummary: function () {
        return __awaiter(this, void 0, void 0, function () {
            var saved, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, client_1.request)('/me/address')];
                    case 1:
                        saved = _b.sent();
                        this.setData({ addressSummary: saved ? '已设置' : '' });
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        this.setData({ addressSummary: '' });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    openEntry: function (event) {
        var route = String(event.currentTarget.dataset.route);
        if (route === 'address')
            wx.navigateTo({ url: '/pages/common-address/common-address' });
        if (route === 'orders')
            wx.switchTab({ url: '/pages/orders/orders' });
    },
    logout: function () {
        wx.showModal({
            title: '退出登录',
            content: '退出后将重新进行微信登录和授权。',
            success: function (result) {
                if (!result.confirm)
                    return;
                var app = getApp();
                wx.removeStorageSync('lbb-auth-token');
                wx.setStorageSync('lbb-force-profile', true);
                app.globalData.authToken = '';
                app.globalData.profile = undefined;
                app.globalData.needsProfile = true;
                app.globalData.login();
                wx.reLaunch({ url: '/pages/index/index' });
            },
        });
    },
});
