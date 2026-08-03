"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const wechat_1 = require("../common/wechat");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const utils_1 = require("../common/utils");
const transition_1 = require("../mixins/transition");
const page_scroll_1 = require("../mixins/page-scroll");
delete props_1.default.visible;
const { prefix: prefix } = config_1.default, name = `${prefix}-popover`;
let Popover = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.behaviors = [(0, transition_1.default)(), (0, page_scroll_1.default)()], this.externalClasses = [`${prefix}-class`, `${prefix}-class-content`, `${prefix}-class-trigger`], this.options = { multipleSlots: !0 }, this.properties = props_1.default, this.data = { prefix: prefix, classPrefix: name, _placement: "top", contentStyle: "", arrowStyle: "" }, this.controlledProps = [{ key: "visible", event: "visible-change" }], this.observers = { visible(t) { null != t && this.updateVisible(t); }, "placement, realVisible"(t) { t && this.computePosition(); } }, this.methods = { onScroll() { this.data.realVisible && (0, utils_1.debounce)(() => this.computePosition(), 100); }, updateVisible(t) { t !== this.data.visible && this.setData({ visible: t }, () => { this._trigger("visible-change", { visible: t }); }); }, onOverlayTap() { this.properties.closeOnClickOutside && this.updateVisible(!1); }, getToward(t) { const e = ["top", "bottom"], i = ["left", "right"]; return { isHorizontal: e.find(e => t.includes(e)), isVertical: i.find(e => t.includes(e)), isBase: [...e, ...i].find(e => e === t), isEnd: t.includes("end") }; }, calcArrowStyle(t, e, i) { const { isHorizontal: o, isVertical: s, isBase: r, isEnd: n } = this.getToward(t); if (r)
            return ""; const { width: l, left: a } = e, { width: c, height: p } = i, { windowWidth: h } = (0, wechat_1.getWindowInfo)(); if (o) {
            const t = n ? Math.min(l + a, c) : Math.min(h - a, c);
            return n ? `left:${t - 28}px;` : `right:${t - 28}px;`;
        } if (s) {
            const t = p - 28;
            return n ? `top:${t}px;` : `bottom:${t}px;top:unset;`;
        } return ""; }, calcContentPosition(t, e, i) { let o = 0, s = 0; const r = t.startsWith("top"), n = t.startsWith("bottom"), l = t.startsWith("left"), a = t.startsWith("right"); r ? o = e.top - i.height : n ? o = e.top + e.height : l ? s = e.left - i.width : a ? s = e.left + e.width : o = e.top - i.height; const c = t.includes("start"), p = t.includes("end"); let h; return h = c ? "start" : p ? "end" : "center", (r || n) && (s = this.alignCrossAxis(e.left, e.width, i.width, h)), (l || a) && (o = this.alignCrossAxis(e.top, e.height, i.height, h)), { top: o, left: s }; }, alignCrossAxis: (t, e, i, o) => "start" === o ? t : "end" === o ? t + e - i : t + e / 2 - i / 2, calcPlacement(t, e, i, o) { return new Promise(s => { const r = this.selectOwnerComponent().createSelectorQuery(); r.select(`.${name}-wrapper--fixed`).boundingClientRect(), r.exec(r => { const [n] = r; n && t && (i = n); const { isHorizontal: l, isVertical: a } = this.getToward(e), { width: c, height: p } = o, { left: h, top: m, right: d, bottom: f } = i; let g = !0; const { windowWidth: u, windowHeight: w } = (0, wechat_1.getWindowInfo)(); let x = e; l ? e.startsWith("top") ? g = m - p >= 0 : e.startsWith("bottom") && (g = f + p <= w) : a && (e.startsWith("left") ? g = h - c >= 0 : e.startsWith("right") && (g = d + c <= u)), g || (l ? x = e.startsWith("top") ? e.replace("top", "bottom") : e.replace("bottom", "top") : a && (x = e.startsWith("left") ? e.replace("left", "right") : e.replace("right", "left"))); const b = this.calcContentPosition(x, i, o); s(Object.assign({ placement: x }, b)); }); }); }, computePosition() { return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () { const { placement: t } = this.data, e = t.replace(/-(left|top)$/, "-start").replace(/-(right|bottom)$/, "-end"); this.setData({ _placement: e }); const i = this.createSelectorQuery(); i.select(`#${name}-wrapper`).boundingClientRect(), i.select(`#${name}-content`).boundingClientRect(), i.selectViewport().scrollOffset(), i.exec(t => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () { const [i, o, s] = t; if (!i || !o)
            return; const r = this.properties.fixed, n = yield this.calcPlacement(r, e, i, o), { placement: l } = n, a = (0, tslib_1.__rest)(n, ["placement"]); this.setData({ _placement: l }); const { scrollTop: c = 0, scrollLeft: p = 0 } = s || {}, h = r ? a.top : a.top + c, m = r ? a.left : a.left + p, d = `top:${Math.max(h, 0)}px;left:${Math.max(m, 0)}px;`, f = this.calcArrowStyle(e, i, o); this.setData({ contentStyle: d, arrowStyle: f }); })); }); } }; }
};
Popover = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Popover);
exports.default = Popover;
