"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextYear = exports.getPrevYear = exports.getNextMonth = exports.getPrevMonth = exports.getYearByOffset = exports.getMonthByOffset = void 0;
function getMonthByOffset(t, e) { const n = new Date(t); return n.setMonth(n.getMonth() + e), n; }
exports.getMonthByOffset = getMonthByOffset;
function getYearByOffset(t, e) { const n = new Date(t); return n.setFullYear(n.getFullYear() + e), n; }
exports.getYearByOffset = getYearByOffset;
const getPrevMonth = t => getMonthByOffset(t, -1);
exports.getPrevMonth = getPrevMonth;
const getNextMonth = t => getMonthByOffset(t, 1);
exports.getNextMonth = getNextMonth;
const getPrevYear = t => getYearByOffset(t, -1);
exports.getPrevYear = getPrevYear;
const getNextYear = t => getYearByOffset(t, 1);
exports.getNextYear = getNextYear;
