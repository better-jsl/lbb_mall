"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimValue = exports.trimSingleValue = void 0;
const trimSingleValue = (r, e, i) => r < e ? e : r > i ? i : r;
exports.trimSingleValue = trimSingleValue;
const trimValue = (r, e) => { const { min: i, max: t, range: n } = e; return n && Array.isArray(r) ? (r[0] = (0, exports.trimSingleValue)(r[0], i, t), r[1] = (0, exports.trimSingleValue)(r[1], i, t), r[0] <= r[1] ? r : [r[1], r[0]]) : n ? [i, t] : n ? void 0 : (0, exports.trimSingleValue)(r, i, t); };
exports.trimValue = trimValue;
