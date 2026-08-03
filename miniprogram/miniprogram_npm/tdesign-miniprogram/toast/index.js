"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hideToast = exports.showToast = exports.default = void 0;
const tslib_1 = require("tslib");
const utils_1 = require("../common/utils");
function Toast(t) { var o; const { context: s, selector: e = "#t-toast" } = t, n = (0, tslib_1.__rest)(t, ["context", "selector"]), a = (0, utils_1.getInstance)(s, e); a && a.show(Object.assign(Object.assign({}, n), { duration: null !== (o = n.duration) && void 0 !== o ? o : 2e3 })); }
exports.default = Toast;
function showToast(t = {}) { Toast(t); }
exports.showToast = showToast;
function hideToast(t = {}) { const { context: o, selector: s = "#t-toast" } = t, e = (0, utils_1.getInstance)(o, s); e && e.hide(); }
exports.hideToast = hideToast;
