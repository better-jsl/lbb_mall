"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../common/utils");
const onPageScroll = function (r) { const e = (0, utils_1.getCurrentPage)(); if (!e)
    return; const { pageScroller: o } = e; null == o || o.forEach(e => { "function" == typeof e && e(r); }); };
exports.default = (r = "onScroll") => Behavior({ attached() { var e; const o = (0, utils_1.getCurrentPage)(); if (!o)
        return; const l = null === (e = this[r]) || void 0 === e ? void 0 : e.bind(this); l && (this._pageScroller = l), Array.isArray(o.pageScroller) ? o.pageScroller.push(l) : o.pageScroller = "function" == typeof o.onPageScroll ? [o.onPageScroll.bind(o), l] : [l], o.onPageScroll = onPageScroll; }, detached() { var r; const e = (0, utils_1.getCurrentPage)(); e && (e.pageScroller = (null === (r = e.pageScroller) || void 0 === r ? void 0 : r.filter(r => r !== this._pageScroller)) || []); } });
