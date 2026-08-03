"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextTick = exports.rpx2px = exports.isOverSize = exports.calcIcon = exports.uniqueFactory = exports.getCurrentPage = exports.toKebabCase = exports.toCamel = exports.setIcon = exports.unitConvert = exports.getInstance = exports.chunk = exports.getCharacterLength = exports.addUnit = exports.isPC = exports.isWxWork = exports.isIOS = exports.getTreeDepth = exports.getRect = exports.getAnimationFrame = exports.styles = exports.classNames = exports.throttle = exports.debounce = exports.deviceInfo = exports.appBaseInfo = exports.systemInfo = void 0;
const config_1 = require("./config");
const validator_1 = require("./validator");
const wechat_1 = require("./wechat");
exports.systemInfo = (0, wechat_1.getWindowInfo)();
exports.appBaseInfo = (0, wechat_1.getAppBaseInfo)();
exports.deviceInfo = (0, wechat_1.getDeviceInfo)();
const debounce = function (e, t = 500) { let n; return function (...o) { n && clearTimeout(n), n = setTimeout(() => { e.apply(this, o); }, t); }; };
exports.debounce = debounce;
const throttle = (e, t = 100, n = null) => { let o = 0, r = null; return n || (n = { leading: !0 }), function (...c) { const s = Date.now(); o || n.leading || (o = s); const i = this; t - (s - o) <= 0 && (r && (clearTimeout(r), r = null), o = s, e.apply(i, c)); }; };
exports.throttle = throttle;
const classNames = function (...e) { const t = {}.hasOwnProperty, n = []; return e.forEach(e => { if (!e)
    return; const o = typeof e; if ("string" === o || "number" === o)
    n.push(e);
else if (Array.isArray(e) && e.length) {
    const t = (0, exports.classNames)(...e);
    t && n.push(t);
}
else if ("object" === o)
    for (const o in e)
        t.call(e, o) && e[o] && n.push(o); }), n.join(" "); };
exports.classNames = classNames;
const styles = function (e) { return Object.keys(e).map(t => `${t}: ${e[t]}`).join("; "); };
exports.styles = styles;
const getAnimationFrame = function (e, t) { return e.createSelectorQuery().selectViewport().boundingClientRect().exec(() => { t(); }); };
exports.getAnimationFrame = getAnimationFrame;
const getRect = function (e, t, n = !1) { return new Promise((o, r) => { e.createSelectorQuery()[n ? "selectAll" : "select"](t).boundingClientRect(e => { e ? o(e) : r(e); }).exec(); }); };
exports.getRect = getRect;
const getTreeDepth = (e, t) => e.reduce((e, n) => n[null != t ? t : "children"] && n[null != t ? t : "children"].length > 0 ? Math.max(e, (0, exports.getTreeDepth)(n[null != t ? t : "children"], t) + 1) : Math.max(e, 1), 0);
exports.getTreeDepth = getTreeDepth;
const isIOS = function () { var e; return !!((null === (e = null == exports.deviceInfo ? void 0 : exports.deviceInfo.system) || void 0 === e ? void 0 : e.toLowerCase().search("ios")) + 1); };
exports.isIOS = isIOS;
exports.isWxWork = "wxwork" === (null == exports.deviceInfo ? void 0 : exports.deviceInfo.environment);
exports.isPC = ["mac", "windows"].includes(null == exports.deviceInfo ? void 0 : exports.deviceInfo.platform);
const addUnit = function (e) { if ((0, validator_1.isDef)(e))
    return e = String(e), (0, validator_1.isNumeric)(e) ? `${e}px` : e; };
exports.addUnit = addUnit;
const getCharacterLength = (e, t, n) => { const o = String(null != t ? t : ""); if (0 === o.length)
    return { length: 0, characters: "" }; if ("maxcharacter" === e) {
    let e = 0;
    for (let t = 0; t < o.length; t += 1) {
        let r = 0;
        if (r = o.charCodeAt(t) > 127 || 94 === o.charCodeAt(t) ? 2 : 1, e + r > n)
            return { length: e, characters: o.slice(0, t) };
        e += r;
    }
    return { length: e, characters: o };
} if ("maxlength" === e) {
    const e = o.length > n ? n : o.length;
    return { length: e, characters: o.slice(0, e) };
} return { length: o.length, characters: o }; };
exports.getCharacterLength = getCharacterLength;
const chunk = (e, t) => Array.from({ length: Math.ceil(e.length / t) }, (n, o) => e.slice(o * t, o * t + t));
exports.chunk = chunk;
const getInstance = function (e, t) { if (!e) {
    const t = getCurrentPages(), n = t[t.length - 1];
    e = n.$$basePage || n;
} const n = e ? e.selectComponent(t) : null; return n || (console.warn("未找到组件,请检查selector是否正确"), null); };
exports.getInstance = getInstance;
const unitConvert = e => { var t; return "string" == typeof e ? e.includes("rpx") ? parseInt(e, 10) * (null !== (t = null == exports.systemInfo ? void 0 : exports.systemInfo.screenWidth) && void 0 !== t ? t : 750) / 750 : parseInt(e, 10) : null != e ? e : 0; };
exports.unitConvert = unitConvert;
const setIcon = (e, t, n) => t ? "string" == typeof t ? { [`${e}Name`]: t, [`${e}Data`]: {} } : "object" == typeof t ? { [`${e}Name`]: "", [`${e}Data`]: t } : { [`${e}Name`]: n, [`${e}Data`]: {} } : { [`${e}Name`]: "", [`${e}Data`]: {} };
exports.setIcon = setIcon;
const toCamel = e => e.replace(/-(\w)/g, (e, t) => t.toUpperCase());
exports.toCamel = toCamel;
function toKebabCase(e) { return e.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z][a-z])/g, "$1-$2").replace(/([0-9])([a-zA-Z])/g, "$1-$2").toLowerCase(); }
exports.toKebabCase = toKebabCase;
const getCurrentPage = function () { const e = getCurrentPages(); return e[e.length - 1]; };
exports.getCurrentPage = getCurrentPage;
const uniqueFactory = e => { let t = 0; return () => { const n = `${config_1.prefix}_${e}_${t}`; return t += 1, n; }; };
exports.uniqueFactory = uniqueFactory;
const calcIcon = (e, t) => e && ((0, validator_1.isBoolean)(e) && t || (0, validator_1.isString)(e)) ? { name: (0, validator_1.isBoolean)(e) ? t : e } : (0, validator_1.isObject)(e) ? e : null;
exports.calcIcon = calcIcon;
const isOverSize = (e, t) => { var n; if (!t)
    return !1; const o = 1e3, r = { B: 1, KB: o, MB: 1e6, GB: 1e9 }; return e > ("number" == typeof t ? t * o : (null == t ? void 0 : t.size) * r[null !== (n = null == t ? void 0 : t.unit) && void 0 !== n ? n : "KB"]); };
exports.isOverSize = isOverSize;
const rpx2px = e => Math.floor(exports.systemInfo.windowWidth * e / 750);
exports.rpx2px = rpx2px;
const nextTick = () => new Promise(e => { wx.nextTick(() => { e(); }); });
exports.nextTick = nextTick;
