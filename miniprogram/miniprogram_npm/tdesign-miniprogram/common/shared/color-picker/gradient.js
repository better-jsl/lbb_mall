"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGradientString = exports.isGradientColor = void 0;
const tinycolor_1 = require("tinycolor2/esm/tinycolor");
const validator_1 = require("../../validator");
const combineRegExp = (e, t) => { let o = ""; for (let t = 0; t < e.length; t += 1)
    (0, validator_1.isString)(e[t]) ? o += e[t] : o += e[t].source; return new RegExp(o, t); }, generateRegExp = () => { const e = /\s*,\s*/, t = /(?:[+-]?\d*\.?\d+)(?:%|[a-z]+)?/, o = combineRegExp(["(?:", /#(?:[a-f0-9]{6}|[a-f0-9]{3})/, "|", "(?:rgb|hsl)", /\(\s*(?:\d{1,3}\s*,\s*){2}\d{1,3}\s*\)/, "|", "(?:rgba|hsla)", /\(\s*(?:\d{1,3}\s*,\s*){2}\d{1,3}\s*,\s*\d*\.?\d+\)/, "|", /[_a-z-][_a-z0-9-]*/, ")"], ""), r = combineRegExp([o, "(?:\\s+", t, "(?:\\s+", t, ")?)?"], ""), i = combineRegExp(["(?:", r, e, ")*", r], ""), n = combineRegExp(["(?:(", /(?:[+-]?\d*\.?\d+)(?:deg|grad|rad|turn)/, ")|", /to\s+((?:(?:left|right|top|bottom)(?:\s+(?:top|bottom|left|right))?))/, ")"], ""); return { gradientSearch: combineRegExp(["(?:(", n, ")", e, ")?(", i, ")"], "gi"), colorStopSearch: combineRegExp(["\\s*(", o, ")", "(?:\\s+", "(", t, "))?", "(?:", e, "\\s*)?"], "gi") }; }, parseGradient = (e, t) => { let o, r, i; e.gradientSearch.lastIndex = 0; const n = e.gradientSearch.exec(t); if (!(0, validator_1.isNull)(n))
    for (o = { original: n[0], colorStopList: [] }, n[1] && (o.line = n[1]), n[2] && (o.angle = n[2]), n[3] && (o.sideCorner = n[3]), e.colorStopSearch.lastIndex = 0, r = e.colorStopSearch.exec(n[4]); !(0, validator_1.isNull)(r);)
        i = { color: r[1] }, r[2] && (i.position = r[2]), o.colorStopList.push(i), r = e.colorStopSearch.exec(n[4]); return o; }, REGEXP_LIB = generateRegExp(), REG_GRADIENT = /.*gradient\s*\(((?:\([^)]*\)|[^)(]*)*)\)/gim;
const isGradientColor = e => (REG_GRADIENT.lastIndex = 0, REG_GRADIENT.exec(e));
exports.isGradientColor = isGradientColor;
const sideCornerDegreeMap = { top: 0, right: 90, bottom: 180, left: 270, "top left": 225, "left top": 225, "top right": 135, "right top": 135, "bottom left": 315, "left bottom": 315, "bottom right": 45, "right bottom": 45 };
const parseGradientString = e => { const t = (0, exports.isGradientColor)(e); if (!t)
    return !1; const o = { points: [], degree: 0 }, r = parseGradient(REGEXP_LIB, t[1]); if (r.original.trim() !== t[1].trim())
    return !1; const i = r.colorStopList.map(({ color: e, position: t }) => { const o = Object.create(null); return o.color = (0, tinycolor_1.default)(e).toRgbString(), o.left = parseFloat(t), o; }); o.points = i; let n = parseInt(r.angle, 10); return Number.isNaN(n) && (n = sideCornerDegreeMap[r.sideCorner] || 90), o.degree = n, o; };
exports.parseGradientString = parseGradientString;
exports.default = exports.parseGradientString;
