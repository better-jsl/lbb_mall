"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = exports.API_BASE_URL = void 0;
exports.API_BASE_URL = 'http://192.168.31.96:8080/api/v1';
function request(path, method = 'GET', data) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${exports.API_BASE_URL}${path}`,
            method,
            data,
            success(response) {
                if (response.statusCode >= 200 && response.statusCode < 300) {
                    resolve(response.data.data);
                    return;
                }
                const errorPayload = response.data;
                reject(new Error(errorPayload.data && errorPayload.data.message ? errorPayload.data.message : `API request failed: ${response.statusCode}`));
            },
            fail: reject,
        });
    });
}
exports.request = request;
