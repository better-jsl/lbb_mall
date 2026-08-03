"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toObject = exports.iterateInheritedPrototype = exports.getPrototypeOf = void 0;
const validator_1 = require("../../common/validator");
const getPrototypeOf = function (t) { return Object.getPrototypeOf ? Object.getPrototypeOf(t) : t.__proto__; };
exports.getPrototypeOf = getPrototypeOf;
const iterateInheritedPrototype = function (t, e, o, r = !0) { let n = e.prototype || e; const c = o.prototype || o; for (; n && (r || n !== c) && !1 !== t(n) && n !== c;)
    n = (0, exports.getPrototypeOf)(n); };
exports.iterateInheritedPrototype = iterateInheritedPrototype;
const toObject = function (t, e = {}) { const o = {}; if (!(0, validator_1.isObject)(t))
    return o; const r = e.excludes || ["constructor"], { enumerable: n = !0, configurable: c = 0, writable: i = 0 } = e, p = {}; return 0 !== n && (p.enumerable = n), 0 !== c && (p.configurable = c), 0 !== i && (p.writable = i), (0, exports.iterateInheritedPrototype)(t => { Object.getOwnPropertyNames(t).forEach(n => { if (r.indexOf(n) >= 0)
    return; if (Object.prototype.hasOwnProperty.call(o, n))
    return; const c = Object.getOwnPropertyDescriptor(t, n); ["get", "set", "value"].forEach(t => { if ("function" == typeof c[t]) {
    const o = c[t];
    c[t] = function (...t) { return o.apply(Object.prototype.hasOwnProperty.call(e, "bindTo") ? e.bindTo : this, t); };
} }), Object.defineProperty(o, n, Object.assign(Object.assign({}, c), p)); }); }, t, e.till || Object, !1), o; };
exports.toObject = toObject;
