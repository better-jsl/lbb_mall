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
Component({
    data: {
        visible: false,
        step: 'phone',
        avatarPreview: '',
        avatarURL: '',
        nickname: '',
        saving: false,
    },
    lifetimes: {
        attached: function () {
            var _this = this;
            var app = getApp();
            app.globalData.loginReady.then(function () {
                var profile = app.globalData.profile;
                _this.setData({ visible: app.globalData.needsProfile, step: profile && profile.phone ? 'profile' : 'phone' });
            });
        },
    },
    methods: {
        chooseAvatar: function (event) {
            return __awaiter(this, void 0, void 0, function () {
                var avatarPreview, avatarURL, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            avatarPreview = event.detail.avatarUrl;
                            if (!avatarPreview)
                                return [2 /*return*/];
                            this.setData({ avatarPreview: avatarPreview });
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, (0, client_1.uploadWechatAvatar)(avatarPreview)];
                        case 2:
                            avatarURL = _a.sent();
                            this.setData({ avatarURL: avatarURL });
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _a.sent();
                            wx.showToast({ title: error_1 instanceof Error ? error_1.message : '头像上传失败', icon: 'none' });
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        },
        inputNickname: function (event) {
            this.setData({ nickname: event.detail.value });
        },
        authorizePhone: function (event) {
            return __awaiter(this, void 0, void 0, function () {
                var phoneCode, session, app, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            phoneCode = event.detail.code;
                            if (!phoneCode) {
                                wx.showToast({ title: '手机号授权未完成', icon: 'none' });
                                return [2 /*return*/];
                            }
                            this.setData({ saving: true });
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, 4, 5]);
                            return [4 /*yield*/, (0, client_1.authorizeWechatPhone)(phoneCode)];
                        case 2:
                            session = _a.sent();
                            app = getApp();
                            app.globalData.authToken = session.token;
                            app.globalData.profile = session.profile;
                            wx.setStorageSync('lbb-auth-token', session.token);
                            this.setData({ step: 'profile' });
                            return [3 /*break*/, 5];
                        case 3:
                            error_2 = _a.sent();
                            wx.showToast({ title: error_2 instanceof Error ? error_2.message : '手机号授权失败', icon: 'none' });
                            return [3 /*break*/, 5];
                        case 4:
                            this.setData({ saving: false });
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        },
        confirmProfile: function () {
            return __awaiter(this, void 0, void 0, function () {
                var nickname, profile, app, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            nickname = this.data.nickname.trim();
                            if (!this.data.avatarURL) {
                                wx.showToast({ title: '请先选择微信头像', icon: 'none' });
                                return [2 /*return*/];
                            }
                            if (!nickname) {
                                wx.showToast({ title: '请填写微信昵称', icon: 'none' });
                                return [2 /*return*/];
                            }
                            this.setData({ saving: true });
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, 4, 5]);
                            return [4 /*yield*/, (0, client_1.updateWechatProfile)({ nickname: nickname, avatar: this.data.avatarURL })];
                        case 2:
                            profile = _a.sent();
                            app = getApp();
                            app.globalData.profile = profile;
                            app.globalData.needsProfile = false;
                            wx.removeStorageSync('lbb-force-profile');
                            this.setData({ visible: false });
                            this.triggerEvent('authorized', profile);
                            return [3 /*break*/, 5];
                        case 3:
                            error_3 = _a.sent();
                            wx.showToast({ title: error_3 instanceof Error ? error_3.message : '资料授权失败', icon: 'none' });
                            return [3 /*break*/, 5];
                        case 4:
                            this.setData({ saving: false });
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        },
    },
});
