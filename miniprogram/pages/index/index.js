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
function hasCompleteAddress(address) {
    return Boolean(address.region &&
        address.region.length === 3 &&
        address.detail &&
        address.detail.trim() &&
        address.contactName &&
        address.contactName.trim() &&
        address.contactPhone &&
        address.contactPhone.trim());
}
function addressText(address) {
    return "".concat(address.region.join(' '), " ").concat(address.detail);
}
Page({
    data: {
        activeMallTab: 'merchants',
        activeMerchant: 0,
        activeExchangeCategory: 0,
        menuButtonTop: 0,
        menuButtonHeight: 0,
        showPackageAnimation: true,
        merchants: [],
        packages: [],
        packagePage: 1,
        packageHasMore: false,
        packageLoading: false,
        packageRefreshing: false,
        packagePullScale: 0,
        exchangeCategories: [],
        exchangeItems: [],
        allExchangeItems: [],
        showExchangeAnimation: true,
        showAffordableOnly: false,
        exchangePage: 1,
        exchangeHasMore: false,
        exchangeLoading: false,
        exchangeRefreshing: false,
        exchangePullScale: 0,
        userPoints: '--',
        showExchangeDialog: false,
        showShippingDialog: false,
        selectedExchangeItem: null,
        shippingAddress: null,
        shippingAddressText: '',
        shippingContactText: '',
        showAppVoucherPhoneDialog: false,
        appVoucherRedemptionID: '',
        appVoucherPhone: '',
        claimingAppVoucher: false,
        redeeming: false,
        networkError: false,
    },
    onLoad: function () {
        var app = getApp();
        this.setData({ menuButtonTop: app.globalData.menuButtonTop, menuButtonHeight: app.globalData.menuButtonHeight });
        wx.setNavigationBarColor({ frontColor: '#000000', backgroundColor: '#f4f6fb' });
        this.loadMerchants();
        this.loadUserPoints();
        this.loadExchangeCatalog();
    },
    onShow: function () {
        var tabBar = this.getTabBar && this.getTabBar();
        if (tabBar)
            tabBar.setData({ selected: 0 });
        if (wx.getStorageSync('mallActiveTab') === 'exchange') {
            wx.removeStorageSync('mallActiveTab');
            this.setData({ activeMallTab: 'exchange' });
        }
    },
    loadMerchants: function () {
        return __awaiter(this, void 0, void 0, function () {
            var merchants, index, response, _a, packages, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, (0, client_1.request)('/merchants')];
                    case 1:
                        merchants = (_c.sent()).map(function (item) { return (__assign(__assign({}, item), { marquee: item.name.length > 5, marqueeDuration: Math.max(6, item.name.length * 0.65).toFixed(1) })); });
                        this.setData({ merchants: merchants });
                        index = 0;
                        _c.label = 2;
                    case 2:
                        if (!(index < merchants.length)) return [3 /*break*/, 6];
                        _a = normalizePage;
                        return [4 /*yield*/, (0, client_1.request)("/merchants/".concat(merchants[index].id, "/packages?page=1&pageSize=10"))];
                    case 3:
                        response = _a.apply(void 0, [_c.sent()]);
                        return [4 /*yield*/, this.loadPackageImages(response.items)];
                    case 4:
                        packages = _c.sent();
                        if (packages.length) {
                            this.setData({ activeMerchant: index, packages: packages, packagePage: 1, packageHasMore: response.hasMore, showPackageAnimation: false }, function () {
                                wx.nextTick(function () { return _this.setData({ showPackageAnimation: true }); });
                            });
                            return [2 /*return*/];
                        }
                        _c.label = 5;
                    case 5:
                        index += 1;
                        return [3 /*break*/, 2];
                    case 6:
                        this.setData({ activeMerchant: 0, packages: [], packagePage: 1, packageHasMore: false });
                        return [3 /*break*/, 8];
                    case 7:
                        _b = _c.sent();
                        this.setData({ networkError: true });
                        wx.showToast({ title: '加载商家失败', icon: 'none' });
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    },
    loadPackages: function (merchantID, page, append) {
        if (page === void 0) { page = 1; }
        if (append === void 0) { append = false; }
        return __awaiter(this, void 0, void 0, function () {
            var response, _a, packageItems, packages, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.data.packageLoading)
                            return [2 /*return*/];
                        this.setData({ packageLoading: true });
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, 5, 6]);
                        _a = normalizePage;
                        return [4 /*yield*/, (0, client_1.request)("/merchants/".concat(merchantID, "/packages?page=").concat(page, "&pageSize=10"))];
                    case 2:
                        response = _a.apply(void 0, [_c.sent()]);
                        return [4 /*yield*/, this.loadPackageImages(response.items)];
                    case 3:
                        packageItems = _c.sent();
                        packages = append ? __spreadArray(__spreadArray([], this.data.packages, true), packageItems, true) : packageItems;
                        this.setData({ packages: packages, packagePage: page, packageHasMore: response.hasMore, showPackageAnimation: false }, function () { return wx.nextTick(function () { return _this.setData({ showPackageAnimation: true }); }); });
                        return [3 /*break*/, 6];
                    case 4:
                        _b = _c.sent();
                        if (!append && !this.data.packages.length)
                            this.setData({ networkError: true });
                        wx.showToast({ title: '加载套餐失败', icon: 'none' });
                        return [3 /*break*/, 6];
                    case 5:
                        this.setData({ packageLoading: false });
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
    loadUserPoints: function () {
        return __awaiter(this, void 0, void 0, function () {
            var summary, points, userPoints, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, client_1.request)('/me/summary')];
                    case 1:
                        summary = _b.sent();
                        points = summary.stats.find(function (item) { return item.label === '积分'; });
                        userPoints = points ? points.value : '--';
                        this.setData({
                            userPoints: userPoints,
                            exchangeItems: this.filterExchangeItems(this.data.allExchangeItems, this.data.showAffordableOnly, userPoints),
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        this.setData({
                            userPoints: '--',
                            exchangeItems: this.filterExchangeItems(this.data.allExchangeItems, this.data.showAffordableOnly, '--'),
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    loadExchangeCatalog: function () {
        return __awaiter(this, void 0, void 0, function () {
            var exchangeCategories, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, (0, client_1.request)('/points/categories')];
                    case 1:
                        exchangeCategories = _b.sent();
                        this.setData({ exchangeCategories: exchangeCategories, activeExchangeCategory: 0 });
                        if (!exchangeCategories.length) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.loadExchangeProducts(exchangeCategories[0].id)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        _a = _b.sent();
                        this.setData({ networkError: true });
                        wx.showToast({ title: '加载兑换商品失败', icon: 'none' });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    loadExchangeProducts: function (categoryID, page, append) {
        if (page === void 0) { page = 1; }
        if (append === void 0) { append = false; }
        return __awaiter(this, void 0, void 0, function () {
            var response, _a, displayItems, exchangeItems, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.data.exchangeLoading)
                            return [2 /*return*/];
                        this.setData({ exchangeLoading: true });
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, 5, 6]);
                        _a = normalizePage;
                        return [4 /*yield*/, (0, client_1.request)("/points/products?category=".concat(encodeURIComponent(categoryID), "&page=").concat(page, "&pageSize=10"))];
                    case 2:
                        response = _a.apply(void 0, [_c.sent()]);
                        return [4 /*yield*/, this.loadExchangeImages(response.items)];
                    case 3:
                        displayItems = _c.sent();
                        exchangeItems = append ? __spreadArray(__spreadArray([], this.data.allExchangeItems, true), displayItems, true) : displayItems;
                        this.setData({
                            allExchangeItems: exchangeItems,
                            exchangeItems: this.filterExchangeItems(exchangeItems, this.data.showAffordableOnly, this.data.userPoints),
                            exchangePage: page,
                            exchangeHasMore: response.hasMore,
                            showExchangeAnimation: false,
                        }, function () { return wx.nextTick(function () { return _this.setData({ showExchangeAnimation: true }); }); });
                        return [3 /*break*/, 6];
                    case 4:
                        _b = _c.sent();
                        if (!append && !this.data.exchangeItems.length)
                            this.setData({ networkError: true });
                        wx.showToast({ title: '加载兑换商品失败', icon: 'none' });
                        return [3 /*break*/, 6];
                    case 5:
                        this.setData({ exchangeLoading: false });
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
    loadPackageImages: function (packages) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.all(packages.map(function (item) { return __awaiter(_this, void 0, void 0, function () {
                        var _a;
                        var _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _a = [__assign({}, item)];
                                    _b = {};
                                    return [4 /*yield*/, (0, local_image_1.localImagePath)(item.coverImage)];
                                case 1: return [2 /*return*/, (__assign.apply(void 0, _a.concat([(_b.coverImage = _c.sent(), _b)])))];
                            }
                        });
                    }); }))];
            });
        });
    },
    loadExchangeImages: function (items) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.all(items.map(function (item) { return __awaiter(_this, void 0, void 0, function () {
                        var _a;
                        var _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _a = [__assign({}, item)];
                                    _b = {};
                                    return [4 /*yield*/, (0, local_image_1.localImagePath)(item.image)];
                                case 1: return [2 /*return*/, (__assign.apply(void 0, _a.concat([(_b.displayImage = _c.sent(), _b)])))];
                            }
                        });
                    }); }))];
            });
        });
    },
    retryNetwork: function () {
        this.setData({ networkError: false });
        this.loadMerchants();
        this.loadUserPoints();
        this.loadExchangeCatalog();
    },
    selectMerchant: function (event) {
        var index = Number(event.currentTarget.dataset.index);
        var merchant = this.data.merchants[index];
        if (!merchant)
            return;
        this.setData({ activeMerchant: index });
        this.loadPackages(merchant.id);
    },
    refreshPackages: function () {
        return __awaiter(this, void 0, void 0, function () {
            var merchant, startedAt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        merchant = this.data.merchants[this.data.activeMerchant];
                        if (!merchant)
                            return [2 /*return*/];
                        startedAt = Date.now();
                        this.setData({ packageRefreshing: true, packagePullScale: 1 });
                        return [4 /*yield*/, this.loadPackages(merchant.id)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, refreshDelay(startedAt)];
                    case 2:
                        _a.sent();
                        this.setData({ packageRefreshing: false, packagePullScale: 0 });
                        return [2 /*return*/];
                }
            });
        });
    },
    onPackagePulling: function (event) {
        this.setData({ packagePullScale: Math.min(1, Math.max(0, event.detail.dy) / 90) });
    },
    onPackageRefreshRestore: function () {
        if (!this.data.packageRefreshing)
            this.setData({ packagePullScale: 0 });
    },
    loadMorePackages: function () {
        var merchant = this.data.merchants[this.data.activeMerchant];
        if (!merchant || !this.data.packageHasMore || this.data.packageLoading)
            return;
        this.loadPackages(merchant.id, this.data.packagePage + 1, true);
    },
    selectMallTab: function (event) {
        this.setData({ activeMallTab: event.detail.value });
    },
    selectExchangeCategory: function (event) {
        var index = Number(event.currentTarget.dataset.index);
        var category = this.data.exchangeCategories[index];
        if (!category)
            return;
        this.setData({ activeExchangeCategory: index });
        this.loadExchangeProducts(category.id);
    },
    refreshExchangeProducts: function () {
        return __awaiter(this, void 0, void 0, function () {
            var category, startedAt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        category = this.data.exchangeCategories[this.data.activeExchangeCategory];
                        if (!category)
                            return [2 /*return*/];
                        startedAt = Date.now();
                        this.setData({ exchangeRefreshing: true, exchangePullScale: 1 });
                        return [4 /*yield*/, this.loadExchangeProducts(category.id)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, refreshDelay(startedAt)];
                    case 2:
                        _a.sent();
                        this.setData({ exchangeRefreshing: false, exchangePullScale: 0 });
                        return [2 /*return*/];
                }
            });
        });
    },
    onExchangePulling: function (event) {
        this.setData({ exchangePullScale: Math.min(1, Math.max(0, event.detail.dy) / 90) });
    },
    onExchangeRefreshRestore: function () {
        if (!this.data.exchangeRefreshing)
            this.setData({ exchangePullScale: 0 });
    },
    loadMoreExchangeProducts: function () {
        var category = this.data.exchangeCategories[this.data.activeExchangeCategory];
        if (!category || !this.data.exchangeHasMore || this.data.exchangeLoading)
            return;
        this.loadExchangeProducts(category.id, this.data.exchangePage + 1, true);
    },
    filterExchangeItems: function (items, affordableOnly, pointsText) {
        if (!affordableOnly)
            return items;
        var userPoints = Number(String(pointsText).replace(/[^\d.]/g, '')) || 0;
        return items.filter(function (item) { return item.points <= userPoints; });
    },
    toggleAffordableOnly: function (event) {
        var _this = this;
        var showAffordableOnly = event.detail.value;
        this.setData({
            showAffordableOnly: showAffordableOnly,
            exchangeItems: this.filterExchangeItems(this.data.allExchangeItems, showAffordableOnly, this.data.userPoints),
            showExchangeAnimation: false,
        }, function () { return wx.nextTick(function () { return _this.setData({ showExchangeAnimation: true }); }); });
    },
    openExchangeDialog: function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var index, item, saved, shippingAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        index = Number(event.currentTarget.dataset.index);
                        item = this.data.exchangeItems[index];
                        if (!item)
                            return [2 /*return*/];
                        if (!(item.redemptionMethod === '快递邮寄')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.loadShippingAddress()];
                    case 1:
                        saved = _a.sent();
                        if (!hasCompleteAddress(saved)) {
                            wx.showModal({
                                title: '请先设置地址',
                                content: '邮寄兑换需要填写联系人、联系电话和收货地址。',
                                confirmText: '去设置',
                                success: function (result) {
                                    if (result.confirm)
                                        wx.navigateTo({ url: '/pages/common-address/common-address' });
                                },
                            });
                            return [2 /*return*/];
                        }
                        shippingAddress = saved;
                        this.setData({
                            selectedExchangeItem: item,
                            showExchangeDialog: false,
                            showShippingDialog: true,
                            shippingAddress: shippingAddress,
                            shippingAddressText: addressText(shippingAddress),
                            shippingContactText: "".concat(shippingAddress.contactName, " ").concat(shippingAddress.contactPhone),
                        });
                        return [2 /*return*/];
                    case 2:
                        this.setData({ selectedExchangeItem: item, showExchangeDialog: true });
                        return [2 /*return*/];
                }
            });
        });
    },
    closeExchangeDialog: function () {
        this.setData({ showExchangeDialog: false });
    },
    closeShippingDialog: function () {
        this.setData({ showShippingDialog: false });
    },
    closeAppVoucherPhoneDialog: function () {
        this.setData({ showAppVoucherPhoneDialog: false, appVoucherRedemptionID: '', appVoucherPhone: '' });
    },
    loadShippingAddress: function () {
        return __awaiter(this, void 0, void 0, function () {
            var saved, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, client_1.request)('/me/address')];
                    case 1:
                        saved = _b.sent();
                        return [2 /*return*/, saved || {}];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, {}];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    preventDialogClose: function () { },
    editShippingAddress: function () {
        this.setData({ showShippingDialog: false });
        wx.navigateTo({ url: '/pages/common-address/common-address' });
    },
    confirmShippingExchange: function () {
        this.redeemSelectedProduct();
    },
    redeemExchange: function () {
        this.redeemSelectedProduct();
    },
    onAppVoucherPhoneInput: function (event) {
        this.setData({ appVoucherPhone: event.detail.value });
    },
    claimAppVoucher: function () {
        return __awaiter(this, void 0, void 0, function () {
            var phone, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        phone = this.data.appVoucherPhone.trim();
                        if (!/^1[3-9]\d{9}$/.test(phone)) {
                            wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
                            return [2 /*return*/];
                        }
                        if (!this.data.appVoucherRedemptionID || this.data.claimingAppVoucher)
                            return [2 /*return*/];
                        this.setData({ claimingAppVoucher: true });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, (0, client_1.request)("/points/redemptions/".concat(encodeURIComponent(this.data.appVoucherRedemptionID), "/app-voucher"), 'POST', { phone: phone })];
                    case 2:
                        _a.sent();
                        this.closeAppVoucherPhoneDialog();
                        wx.showToast({ title: '领取信息已提交', icon: 'success' });
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        wx.showToast({ title: error_1 instanceof Error ? error_1.message : '领取失败', icon: 'none' });
                        return [3 /*break*/, 5];
                    case 4:
                        this.setData({ claimingAppVoucher: false });
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    redeemSelectedProduct: function () {
        return __awaiter(this, void 0, void 0, function () {
            var item, result_1, userPoints, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        item = this.data.selectedExchangeItem;
                        if (!item || this.data.redeeming)
                            return [2 /*return*/];
                        this.setData({ redeeming: true });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, (0, client_1.request)("/points/products/".concat(encodeURIComponent(item.id), "/redeem"), 'POST')];
                    case 2:
                        result_1 = _a.sent();
                        userPoints = String(result_1.points);
                        this.setData({
                            showExchangeDialog: false,
                            showShippingDialog: false,
                            selectedExchangeItem: null,
                            userPoints: userPoints,
                            exchangeItems: this.filterExchangeItems(this.data.allExchangeItems, this.data.showAffordableOnly, userPoints),
                        });
                        wx.showToast({ title: '兑换成功', icon: 'success' });
                        if (result_1.isAppVoucher) {
                            wx.showModal({
                                title: '兑换成功',
                                content: '优惠券已到账，是否现在就使用？',
                                cancelText: '稍后使用',
                                confirmText: '现在使用',
                                success: function (modal) {
                                    if (modal.confirm)
                                        _this.setData({ showAppVoucherPhoneDialog: true, appVoucherRedemptionID: result_1.id });
                                },
                            });
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        error_2 = _a.sent();
                        wx.showToast({ title: error_2 instanceof Error ? error_2.message : '兑换失败', icon: 'none' });
                        return [3 /*break*/, 5];
                    case 4:
                        this.setData({ redeeming: false });
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    showPackageDetail: function (event) {
        var id = String(event.currentTarget.dataset.id);
        wx.navigateTo({ url: "/pages/package-detail/package-detail?id=".concat(encodeURIComponent(id)) });
    },
});
