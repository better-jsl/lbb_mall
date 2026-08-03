"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canUseProxyScrollView = exports.canUseVirtualHost = exports.canIUseFormFieldButton = exports.compareVersion = void 0;
const wechat_1 = require("./wechat");
let systemInfo;
function getSystemInfo() { return null == systemInfo && (systemInfo = (0, wechat_1.getAppBaseInfo)()), systemInfo; }
function compareVersion(e, n) { e = e.split("."), n = n.split("."); const t = Math.max(e.length, n.length); for (; e.length < t;)
    e.push("0"); for (; n.length < t;)
    n.push("0"); for (let r = 0; r < t; r += 1) {
    const t = parseInt(e[r], 10), o = parseInt(n[r], 10);
    if (t > o)
        return 1;
    if (t < o)
        return -1;
} return 0; }
exports.compareVersion = compareVersion;
function judgeByVersion(e) { return compareVersion(getSystemInfo().SDKVersion, e) >= 0; }
function canIUseFormFieldButton() { return judgeByVersion("2.10.3"); }
exports.canIUseFormFieldButton = canIUseFormFieldButton;
function canUseVirtualHost() { return judgeByVersion("2.19.2"); }
exports.canUseVirtualHost = canUseVirtualHost;
function canUseProxyScrollView() { return judgeByVersion("2.19.2"); }
exports.canUseProxyScrollView = canUseProxyScrollView;
