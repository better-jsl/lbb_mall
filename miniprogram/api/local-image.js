"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.localImagePaths = exports.localImagePath = void 0;
const imagePathCache = {};
let fileSequence = 0;
function localImagePath(url) {
    if (!url || url.indexOf('http') !== 0 || imagePathCache[url])
        return Promise.resolve(imagePathCache[url] || url);
    return new Promise((resolve) => {
        wx.request({
            url,
            responseType: 'arraybuffer',
            success(response) {
                if (response.statusCode < 200 || response.statusCode >= 300) {
                    resolve(url);
                    return;
                }
                const extension = (url.match(/\.(png|jpe?g|webp)(?:\?.*)?$/i) || [])[1] || 'jpg';
                const filePath = `${wx.env.USER_DATA_PATH}/lbb-image-${Date.now()}-${fileSequence += 1}.${extension}`;
                wx.getFileSystemManager().writeFile({
                    filePath,
                    data: response.data,
                    success() {
                        imagePathCache[url] = filePath;
                        resolve(filePath);
                    },
                    fail() {
                        resolve(url);
                    },
                });
            },
            fail() {
                resolve(url);
            },
        });
    });
}
exports.localImagePath = localImagePath;
function localImagePaths(urls) {
    return Promise.all(urls.map((url) => localImagePath(url)));
}
exports.localImagePaths = localImagePaths;
