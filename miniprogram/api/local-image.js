"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.localImagePaths = exports.localImagePath = void 0;
var imagePathCache = {};
var fileSequence = 0;
function localImagePath(url) {
    if (!url || url.indexOf('http') !== 0 || imagePathCache[url])
        return Promise.resolve(imagePathCache[url] || url);
    return new Promise(function (resolve) {
        wx.request({
            url: url,
            responseType: 'arraybuffer',
            success: function (response) {
                if (response.statusCode < 200 || response.statusCode >= 300) {
                    resolve(url);
                    return;
                }
                var extension = (url.match(/\.(png|jpe?g|webp)(?:\?.*)?$/i) || [])[1] || 'jpg';
                var filePath = "".concat(wx.env.USER_DATA_PATH, "/lbb-image-").concat(Date.now(), "-").concat(fileSequence += 1, ".").concat(extension);
                wx.getFileSystemManager().writeFile({
                    filePath: filePath,
                    data: response.data,
                    success: function () {
                        imagePathCache[url] = filePath;
                        resolve(filePath);
                    },
                    fail: function () {
                        resolve(url);
                    },
                });
            },
            fail: function () {
                resolve(url);
            },
        });
    });
}
exports.localImagePath = localImagePath;
function localImagePaths(urls) {
    return Promise.all(urls.map(function (url) { return localImagePath(url); }));
}
exports.localImagePaths = localImagePaths;
