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
exports.uploadWechatAvatar = exports.updateWechatProfile = exports.authorizeWechatPhone = exports.loginWithWeChat = exports.request = exports.API_BASE_URL = void 0;
exports.API_BASE_URL = 'http://192.168.3.77:8080/api/v1';
function requestHeaders() {
    var token = getApp().globalData.authToken;
    return token ? { Authorization: "Bearer ".concat(token) } : {};
}
function rawRequest(path, method, data) {
    if (method === void 0) { method = 'GET'; }
    return new Promise(function (resolve, reject) {
        wx.request({
            url: "".concat(exports.API_BASE_URL).concat(path),
            method: method,
            data: data,
            header: requestHeaders(),
            success: function (response) {
                if (response.statusCode >= 200 && response.statusCode < 300) {
                    resolve(response.data.data);
                    return;
                }
                var errorPayload = response.data;
                reject(new Error(errorPayload.data && errorPayload.data.message ? errorPayload.data.message : "API request failed: ".concat(response.statusCode)));
            },
            fail: reject,
        });
    });
}
function request(path, method, data) {
    if (method === void 0) { method = 'GET'; }
    return getApp().globalData.loginReady.then(function () { return rawRequest(path, method, data); });
}
exports.request = request;
function loginWithWeChat(code) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, rawRequest('/auth/wechat/login', 'POST', { code: code })];
        });
    });
}
exports.loginWithWeChat = loginWithWeChat;
function authorizeWechatPhone(phoneCode) {
    return rawRequest('/me/phone', 'POST', { phoneCode: phoneCode });
}
exports.authorizeWechatPhone = authorizeWechatPhone;
function updateWechatProfile(data) {
    return rawRequest('/me/profile', 'PUT', data);
}
exports.updateWechatProfile = updateWechatProfile;
function uploadWechatAvatar(filePath) {
    return new Promise(function (resolve, reject) {
        wx.uploadFile({
            url: "".concat(exports.API_BASE_URL, "/auth/wechat/avatar"),
            filePath: filePath,
            name: 'file',
            header: requestHeaders(),
            success: function (response) {
                try {
                    var payload = JSON.parse(response.data);
                    if (response.statusCode >= 200 && response.statusCode < 300 && payload.data.url) {
                        resolve(payload.data.url);
                        return;
                    }
                    reject(new Error('头像上传失败'));
                }
                catch (_a) {
                    reject(new Error('头像上传失败'));
                }
            },
            fail: reject,
        });
    });
}
exports.uploadWechatAvatar = uploadWechatAvatar;
