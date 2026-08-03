"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getColorObject = exports.Color = exports.genGradientPoint = exports.genId = exports.getColorWithoutAlpha = exports.gradientColors2string = void 0;
const tinycolor_1 = require("tinycolor2/esm/tinycolor");
const cmyk_1 = require("./cmyk");
const gradient_1 = require("./gradient");
const mathRound = Math.round, hsv2rgba = t => (0, tinycolor_1.default)(t).toRgb(), hsv2hsva = t => (0, tinycolor_1.default)(t).toHsv(), hsv2hsla = t => (0, tinycolor_1.default)(t).toHsl();
const gradientColors2string = t => { const { points: e, degree: r } = t; return `linear-gradient(${r}deg,${e.sort((t, e) => t.left - e.left).map(t => `${t.color} ${Math.round(100 * t.left) / 100}%`).join(",")})`; };
exports.gradientColors2string = gradientColors2string;
const getColorWithoutAlpha = t => (0, tinycolor_1.default)(t).setAlpha(1).toHexString();
exports.getColorWithoutAlpha = getColorWithoutAlpha;
const genId = () => (1 + 4294967295 * Math.random()).toString(16);
exports.genId = genId;
const genGradientPoint = (t, e) => ({ id: (0, exports.genId)(), left: t, color: e });
exports.genGradientPoint = genGradientPoint;
class Color {
    constructor(t) { this.states = { s: 100, v: 100, h: 100, a: 1 }, this.gradientStates = { colors: [], degree: 0, selectedId: null, css: "" }, this.update(t); }
    update(t) { var e, r; const s = (0, gradient_1.parseGradientString)(t); if (this.isGradient && !s) {
        const e = (0, tinycolor_1.default)(t).toHsv();
        return this.states = e, void this.updateCurrentGradientColor();
    } this.originColor = t, this.isGradient = !1; let a = t; if (s) {
        this.isGradient = !0;
        const t = s, i = t.points.map(t => (0, exports.genGradientPoint)(t.left, t.color));
        this.gradientStates = { colors: i, degree: t.degree, selectedId: (null === (e = i[0]) || void 0 === e ? void 0 : e.id) || null }, this.gradientStates.css = this.linearGradient, a = null === (r = this.gradientSelectedPoint) || void 0 === r ? void 0 : r.color;
    } this.updateStates(a); }
    get saturation() { return this.states.s; }
    set saturation(t) { this.states.s = Math.max(0, Math.min(100, t)), this.updateCurrentGradientColor(); }
    get value() { return this.states.v; }
    set value(t) { this.states.v = Math.max(0, Math.min(100, t)), this.updateCurrentGradientColor(); }
    get hue() { return this.states.h; }
    set hue(t) { this.states.h = Math.max(0, Math.min(360, t)), this.updateCurrentGradientColor(); }
    get alpha() { return this.states.a; }
    set alpha(t) { this.states.a = Math.max(0, Math.min(1, Math.round(100 * t) / 100)), this.updateCurrentGradientColor(); }
    get rgb() { const { r: t, g: e, b: r } = hsv2rgba(this.states); return `rgb(${mathRound(t)}, ${mathRound(e)}, ${mathRound(r)})`; }
    get rgba() { const { r: t, g: e, b: r, a: s } = hsv2rgba(this.states); return `rgba(${mathRound(t)}, ${mathRound(e)}, ${mathRound(r)}, ${s})`; }
    get hsv() { const { h: t, s: e, v: r } = this.getHsva(); return `hsv(${t}, ${e}%, ${r}%)`; }
    get hsva() { const { h: t, s: e, v: r, a: s } = this.getHsva(); return `hsva(${t}, ${e}%, ${r}%, ${s})`; }
    get hsl() { const { h: t, s: e, l: r } = this.getHsla(); return `hsl(${t}, ${e}%, ${r}%)`; }
    get hsla() { const { h: t, s: e, l: r, a: s } = this.getHsla(); return `hsla(${t}, ${e}%, ${r}%, ${s})`; }
    get hex() { return (0, tinycolor_1.default)(this.states).toHexString(); }
    get hex8() { return (0, tinycolor_1.default)(this.states).toHex8String(); }
    get cmyk() { const { c: t, m: e, y: r, k: s } = this.getCmyk(); return `cmyk(${t}, ${e}, ${r}, ${s})`; }
    get css() { return this.isGradient ? this.linearGradient : this.rgba; }
    get linearGradient() { const { gradientColors: t, gradientDegree: e } = this; return (0, exports.gradientColors2string)({ points: t, degree: e }); }
    get gradientColors() { return this.gradientStates.colors; }
    set gradientColors(t) { this.gradientStates.colors = t, this.gradientStates.css = this.linearGradient; }
    get gradientSelectedId() { return this.gradientStates.selectedId; }
    set gradientSelectedId(t) { var e; t !== this.gradientSelectedId && (this.gradientStates.selectedId = t, this.updateStates(null === (e = this.gradientSelectedPoint) || void 0 === e ? void 0 : e.color)); }
    get gradientDegree() { return this.gradientStates.degree; }
    set gradientDegree(t) { this.gradientStates.degree = Math.max(0, Math.min(360, t)), this.gradientStates.css = this.linearGradient; }
    get gradientSelectedPoint() { const { gradientColors: t, gradientSelectedId: e } = this; return t.find(t => t.id === e); }
    getFormatsColorMap() { return { HEX: this.hex, CMYK: this.cmyk, RGB: this.rgb, RGBA: this.rgba, HSL: this.hsl, HSLA: this.hsla, HSV: this.hsv, HSVA: this.hsva, CSS: this.css, HEX8: this.hex8 }; }
    updateCurrentGradientColor() { const { isGradient: t, gradientColors: e, gradientSelectedId: r } = this, { length: s } = e, a = this.gradientSelectedPoint; if (!t || 0 === s || !a)
        return !1; const i = e.findIndex(t => t.id === r), n = Object.assign(Object.assign({}, a), { color: this.rgba }); return e.splice(i, 1, n), this.gradientColors = e.slice(), this; }
    updateStates(t) { const e = (0, tinycolor_1.default)((0, cmyk_1.cmykInputToColor)(t)).toHsv(); this.states = e; }
    getRgba() { const { r: t, g: e, b: r, a: s } = hsv2rgba(this.states); return { r: mathRound(t), g: mathRound(e), b: mathRound(r), a: s }; }
    getCmyk() { const { r: t, g: e, b: r } = this.getRgba(), [s, a, i, n] = (0, cmyk_1.rgb2cmyk)(t, e, r); return { c: mathRound(100 * s), m: mathRound(100 * a), y: mathRound(100 * i), k: mathRound(100 * n) }; }
    getHsva() { let { h: t, s: e, v: r, a: s } = hsv2hsva(this.states); return t = mathRound(t), e = mathRound(100 * e), r = mathRound(100 * r), s *= 1, { h: t, s: e, v: r, a: s }; }
    getHsla() { let { h: t, s: e, l: r, a: s } = hsv2hsla(this.states); return t = mathRound(t), e = mathRound(100 * e), r = mathRound(100 * r), s *= 1, { h: t, s: e, l: r, a: s }; }
    equals(t) { return tinycolor_1.default.equals(this.rgba, t); }
    static isValid(t) { return !!(0, gradient_1.parseGradientString)(t) || (0, tinycolor_1.default)(t).isValid(); }
    static hsva2color(t, e, r, s) { return (0, tinycolor_1.default)({ h: t, s: e, v: r, a: s }).toHsvString(); }
    static hsla2color(t, e, r, s) { return (0, tinycolor_1.default)({ h: t, s: e, l: r, a: s }).toHslString(); }
    static rgba2color(t, e, r, s) { return (0, tinycolor_1.default)({ r: t, g: e, b: r, a: s }).toHsvString(); }
    static hex2color(t, e) { const r = (0, tinycolor_1.default)(t); return r.setAlpha(e), r.toHexString(); }
    static object2color(t, e) { if ("CMYK" === e) {
        const { c: e, m: r, y: s, k: a } = t;
        return `cmyk(${e}, ${r}, ${s}, ${a})`;
    } return (0, tinycolor_1.default)(t, { format: e }).toRgbString(); }
}
exports.Color = Color;
Color.isGradientColor = t => !!(0, gradient_1.isGradientColor)(t), Color.compare = (t, e) => { const r = Color.isGradientColor(t), s = Color.isGradientColor(e); if (r && s) {
    return (0, exports.gradientColors2string)((0, gradient_1.parseGradientString)(t)) === (0, exports.gradientColors2string)((0, gradient_1.parseGradientString)(e));
} return !r && !s && tinycolor_1.default.equals(t, e); };
const COLOR_OBJECT_OUTPUT_KEYS = ["alpha", "css", "hex", "hex8", "hsl", "hsla", "hsv", "hsva", "rgb", "rgba", "saturation", "value", "isGradient"];
const getColorObject = t => { if (!t)
    return null; const e = Object.create(null); return COLOR_OBJECT_OUTPUT_KEYS.forEach(r => e[r] = t[r]), t.isGradient && (e.linearGradient = t.linearGradient), e; };
exports.getColorObject = getColorObject;
exports.default = Color;
