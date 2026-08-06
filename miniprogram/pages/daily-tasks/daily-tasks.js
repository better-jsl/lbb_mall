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
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("../../api/client");
function actionText(task) {
    if (task.completed)
        return '已完成';
    if (task.action === 'check-in')
        return '签到';
    if (task.action === 'share')
        return '去分享';
    return '去浏览';
}
Page({
    data: {
        menuButtonTop: 0,
        menuButtonHeight: 0,
        tasks: [],
        networkError: false,
    },
    onLoad: function () {
        var app = getApp();
        this.setData({ menuButtonTop: app.globalData.menuButtonTop, menuButtonHeight: app.globalData.menuButtonHeight });
        wx.setNavigationBarColor({ frontColor: '#000000', backgroundColor: '#f4f6fb' });
    },
    onShow: function () {
        this.loadTasks();
    },
    loadTasks: function () {
        return __awaiter(this, void 0, void 0, function () {
            var tasks, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, client_1.request)('/daily-tasks')];
                    case 1:
                        tasks = _b.sent();
                        this.setData({ tasks: tasks.map(function (task) { return (__assign(__assign({}, task), { actionText: actionText(task) })); }), networkError: false });
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        this.setData({ networkError: true });
                        wx.showToast({ title: '加载每日任务失败', icon: 'none' });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    retryNetwork: function () { this.setData({ networkError: false }); this.loadTasks(); },
    handleTask: function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var id, task, result, checkIn, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = String(event.currentTarget.dataset.id);
                        task = this.data.tasks.find(function (item) { return item.id === id; });
                        if (!task || task.completed)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        result = void 0;
                        if (!(task.action === 'check-in')) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, client_1.request)('/me/daily-check-in', 'POST')];
                    case 2:
                        checkIn = _a.sent();
                        result = { completed: checkIn.checkedIn, awarded: checkIn.awarded, reward: checkIn.reward, points: checkIn.points };
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, (0, client_1.request)("/daily-tasks/".concat(encodeURIComponent(task.id), "/complete"), 'POST')];
                    case 4:
                        result = _a.sent();
                        _a.label = 5;
                    case 5: return [4 /*yield*/, this.loadTasks()];
                    case 6:
                        _a.sent();
                        wx.showToast({ title: result.awarded ? "\u4EFB\u52A1\u5B8C\u6210\uFF0C\u83B7\u5F97".concat(result.reward, "\u79EF\u5206") : '今日已完成', icon: 'none' });
                        if (task.action === 'mall') {
                            wx.setStorageSync('mallActiveTab', 'exchange');
                            wx.switchTab({ url: '/pages/index/index' });
                        }
                        else if (task.action === 'share') {
                            wx.showShareMenu({ withShareTicket: false });
                        }
                        return [3 /*break*/, 8];
                    case 7:
                        error_1 = _a.sent();
                        wx.showToast({ title: error_1 instanceof Error ? error_1.message : '任务完成失败', icon: 'none' });
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    },
    goBack: function () {
        wx.navigateBack();
    },
});
