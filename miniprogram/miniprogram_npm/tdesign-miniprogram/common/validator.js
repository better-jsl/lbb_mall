"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isURL = exports.isEmail = exports.isDate = exports.isEmpty = exports.isPlainObject = exports.isObject = exports.isBoolean = exports.isNumber = exports.isNumeric = exports.isInteger = exports.isDef = exports.isUndefined = exports.isNull = exports.isString = exports.isFunction = void 0;
function isFunction(t) { return "function" == typeof t; }
exports.isFunction = isFunction;
const isString = t => "string" == typeof t;
exports.isString = isString;
const isNull = t => null === t;
exports.isNull = isNull;
const isUndefined = t => void 0 === t;
exports.isUndefined = isUndefined;
function isDef(t) { return !(0, exports.isUndefined)(t) && !(0, exports.isNull)(t); }
exports.isDef = isDef;
function isInteger(t) { return Number.isInteger(t); }
exports.isInteger = isInteger;
function isNumeric(t) { return !Number.isNaN(Number(t)); }
exports.isNumeric = isNumeric;
function isNumber(t) { return "number" == typeof t; }
exports.isNumber = isNumber;
function isBoolean(t) { return "boolean" == typeof t; }
exports.isBoolean = isBoolean;
function isObject(t) { const e = typeof t; return null !== t && ("object" === e || "function" === e); }
exports.isObject = isObject;
function isPlainObject(t) { return null !== t && "object" == typeof t && "[object Object]" === Object.prototype.toString.call(t); }
exports.isPlainObject = isPlainObject;
function isEmpty(t) { return null == t || ("string" == typeof t || Array.isArray(t) ? 0 === t.length : t instanceof Map || t instanceof Set ? 0 === t.size : "object" != typeof t || 0 === Object.keys(t).length); }
exports.isEmpty = isEmpty;
function isDate(t, e) { const r = Object.assign(Object.assign({}, { format: "YYYY/MM/DD", delimiters: ["/", "-"], strictMode: !1 }), e); if ("string" == typeof t) {
    const e = r.delimiters.find(t => r.format.includes(t));
    if (!e)
        return !1;
    const n = r.format.split(e), i = t.split(e);
    if (n.length !== i.length)
        return !1;
    let o = "", s = "", u = "";
    for (let t = 0; t < n.length; t += 1) {
        const e = n[t].toUpperCase(), r = i[t];
        e.includes("Y") ? o = r : e.includes("M") ? s = r : e.includes("D") && (u = r);
    }
    if (1 === s.length && (s = `0${s}`), 1 === u.length && (u = `0${u}`), 2 === o.length) {
        const t = (new Date).getFullYear() % 100;
        o = Number(o) <= t ? `20${o}` : `19${o}`;
    }
    const l = new Date(`${o}-${s}-${u}T00:00:00.000Z`);
    return l.getUTCFullYear() === Number(o) && l.getUTCMonth() + 1 === Number(s) && l.getUTCDate() === Number(u);
} return !(r.strictMode || "[object Date]" !== Object.prototype.toString.call(t) || !Number.isFinite(t.getTime())); }
exports.isDate = isDate;
function isEmail(t) { if ("string" != typeof t)
    return !1; if (t.length > 254)
    return !1; const e = t.split("@"); if (2 !== e.length)
    return !1; const [r, n] = e; if (!r || r.length > 64)
    return !1; if (!n)
    return !1; if (/^[-.]/.test(n) || /[-.]$/.test(n))
    return !1; if (!/^[a-zA-Z0-9.-]+$/.test(n))
    return !1; if (!n.includes("."))
    return !1; const i = n.split(".").pop(); if (!i || i.length < 2)
    return !1; return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(r); }
exports.isEmail = isEmail;
function isURL(t, e) { if ("string" != typeof t)
    return !1; if (0 === t.length || /\s/.test(t))
    return !1; if (t.length > 2084)
    return !1; const r = Object.assign(Object.assign({}, { protocols: ["http", "https", "ftp"], require_tld: !0, require_protocol: !1, require_host: !0, allow_protocol_relative_urls: !1 }), e); let n = t; const i = n.match(/^([a-z][a-z0-9+\-.]*):\/\//i); if (i) {
    const t = i[1].toLowerCase();
    if (!r.protocols.includes(t))
        return !1;
    n = n.slice(i[0].length);
}
else if (r.require_protocol) {
    if (!r.allow_protocol_relative_urls || !t.startsWith("//"))
        return !1;
    n = n.slice(2);
}
else if (t.startsWith("//")) {
    if (!r.allow_protocol_relative_urls)
        return !1;
    n = n.slice(2);
} if (!n && r.require_host)
    return !1; const [o] = n.split(/[/?#]/); if (!o && r.require_host)
    return !1; let s = o; s.includes("@") && (s = s.split("@").pop() || ""); let u = s; const l = s.match(/:(\d+)$/); if (l) {
    const t = Number(l[1]);
    if (t < 0 || t > 65535)
        return !1;
    u = s.slice(0, s.lastIndexOf(":"));
} if (!u)
    return !1; const c = u.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/); if (c)
    return c.slice(1).every(t => Number(t) >= 0 && Number(t) <= 255); if (u.startsWith("[") && u.endsWith("]"))
    return !0; const f = u.split("."); if (r.require_tld && f.length < 2)
    return !1; if (f.some(t => !t || t.length > 63 || (!/^[a-zA-Z0-9-]+$/.test(t) || !(!t.startsWith("-") && !t.endsWith("-")))))
    return !1; if (r.require_tld) {
    const t = f[f.length - 1];
    if (/^\d+$/.test(t))
        return !1;
} return !0; }
exports.isURL = isURL;
