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
Page({
    data: { menuButtonTop: 0, menuButtonHeight: 0, activeStatus: 'available', coupons: [], networkError: false, selectedAppVoucher: null, appVoucherPhone: '', showAppVoucherDialog: false, claimingAppVoucher: false },
    onLoad: function () { var app = getApp(); this.setData({ menuButtonTop: app.globalData.menuButtonTop, menuButtonHeight: app.globalData.menuButtonHeight }); this.loadCoupons('available'); },
    loadCoupons: function (status) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        _a = this.setData;
                        _c = {};
                        return [4 /*yield*/, (0, client_1.request)("/coupons?status=".concat(status))];
                    case 1:
                        _a.apply(this, [(_c.coupons = _d.sent(), _c.networkError = false, _c)]);
                        return [3 /*break*/, 3];
                    case 2:
                        _b = _d.sent();
                        this.setData({ networkError: true });
                        wx.showToast({ title: '加载优惠券失败', icon: 'none' });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    retryNetwork: function () { this.setData({ networkError: false }); this.loadCoupons(this.data.activeStatus); },
    selectStatus: function (event) { var activeStatus = event.detail.value; this.setData({ activeStatus: activeStatus }); this.loadCoupons(activeStatus); },
    openCoupon: function (event) {
        var coupon = this.data.coupons[Number(event.currentTarget.dataset.index)];
        if (!coupon || !coupon.isAppVoucher || !coupon.redemptionId)
            return;
        if (coupon.appVoucherClaimed) {
            wx.showToast({ title: '领取信息已提交', icon: 'none' });
            return;
        }
        this.setData({ selectedAppVoucher: coupon, appVoucherPhone: '', showAppVoucherDialog: true });
    },
    closeAppVoucherDialog: function () { this.setData({ selectedAppVoucher: null, appVoucherPhone: '', showAppVoucherDialog: false }); },
    preventDialogClose: function () { },
    onAppVoucherPhoneInput: function (event) { this.setData({ appVoucherPhone: event.detail.value }); },
    claimAppVoucher: function () {
        return __awaiter(this, void 0, void 0, function () {
            var phone, coupon, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        phone = this.data.appVoucherPhone.trim();
                        coupon = this.data.selectedAppVoucher;
                        if (!/^1[3-9]\d{9}$/.test(phone)) {
                            wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
                            return [2 /*return*/];
                        }
                        if (!coupon || !coupon.redemptionId || this.data.claimingAppVoucher)
                            return [2 /*return*/];
                        this.setData({ claimingAppVoucher: true });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, (0, client_1.request)("/points/redemptions/".concat(encodeURIComponent(coupon.redemptionId), "/app-voucher"), 'POST', { phone: phone })];
                    case 2:
                        _a.sent();
                        this.closeAppVoucherDialog();
                        return [4 /*yield*/, this.loadCoupons(this.data.activeStatus)];
                    case 3:
                        _a.sent();
                        wx.showToast({ title: '领取信息已提交', icon: 'success' });
                        return [3 /*break*/, 6];
                    case 4:
                        error_1 = _a.sent();
                        wx.showToast({ title: error_1 instanceof Error ? error_1.message : '领取失败', icon: 'none' });
                        return [3 /*break*/, 6];
                    case 5:
                        this.setData({ claimingAppVoucher: false });
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
    goBack: function () { wx.navigateBack(); },
});
