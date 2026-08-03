"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDate = exports.isValidDate = exports.getMonthDateRect = exports.isSameDate = exports.getDateRect = void 0;
const getDateRect = e => { const t = new Date(e); return { year: t.getFullYear(), month: t.getMonth(), date: t.getDate(), day: t.getDay(), time: t.getTime() }; };
exports.getDateRect = getDateRect;
const isSameDate = (e, t) => { (e instanceof Date || "number" == typeof e) && (e = (0, exports.getDateRect)(e)), (t instanceof Date || "number" == typeof t) && (t = (0, exports.getDateRect)(t)); return ["year", "month", "date"].every(a => e[a] === t[a]); };
exports.isSameDate = isSameDate;
const getMonthDateRect = e => { const { year: t, month: a } = (0, exports.getDateRect)(e); return { year: t, month: a, weekdayOfFirstDay: new Date(t, a, 1).getDay(), lastDate: new Date(+new Date(t, a + 1, 1) - 864e5).getDate() }; };
exports.getMonthDateRect = getMonthDateRect;
const isValidDate = e => "number" == typeof e || e instanceof Date;
exports.isValidDate = isValidDate;
const getDate = (...e) => { const t = new Date; if (0 === e.length)
    return t; if (1 === e.length && e[0] <= 1e3) {
    const { year: a, month: n, date: r } = (0, exports.getDateRect)(t);
    return new Date(a, n + e[0], r);
} return Date.apply(null, e); };
exports.getDate = getDate;
