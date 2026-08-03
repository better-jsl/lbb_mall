"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const { prefix: prefix } = config_1.default, name = `${prefix}-swiper`;
let Swiper = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`, `${prefix}-class-nav`, `${prefix}-class-image`, `${prefix}-class-prev-image`, `${prefix}-class-next-image`], this.options = { multipleSlots: !0, pureDataPattern: /^_/ }, this.properties = props_1.default, this.observers = { navCurrent(t) { this.updateNav(t); } }, this.$nav = null, this.relations = { "../swiper-nav/swiper-nav": { type: "child" } }, this.data = { prefix: prefix, classPrefix: name, _source: "" }, this.lifetimes = { ready() { const { current: t } = this.properties; this.setData({ navCurrent: t }); } }, this.methods = { updateNav(t) { var e; if (this.data.navigation)
            return; const r = null === (e = this.getRelationNodes("./swiper-nav")) || void 0 === e ? void 0 : e[0]; if (!r)
            return; const { direction: i, paginationPosition: n, list: s } = this.properties; r.setData({ current: t, total: s.length, direction: i, paginationPosition: n }); }, onTap(t) { const { index: e } = t.currentTarget.dataset; this.triggerEvent("click", { index: e }); }, onChange(t) { const { current: e, source: r } = t.detail; r && (this.setData({ navCurrent: e, _source: r }), this.triggerEvent("change", { current: e, source: r })); }, onAnimationFinish(t) { const { current: e, source: r } = t.detail; this.triggerEvent("animationfinish", { current: e, source: r || this.data._source }); }, onNavBtnChange(t) { const { dir: e, source: r } = t.detail; this.doNavBtnChange(e, r); }, doNavBtnChange(t, e) { const { current: r, list: i, loop: n } = this.data, s = i.length; let o = "next" === t ? r + 1 : r - 1; o = n ? "next" === t ? (r + 1) % s : (r - 1 + s) % s : o < 0 || o >= s ? r : o, o !== r && (this.setData({ current: o, _source: e }), this.triggerEvent("change", { current: o, source: e })); }, onImageLoad(t) { this.triggerEvent("image-load", { index: t.target.dataset.custom }); } }; }
};
Swiper = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Swiper);
exports.default = Swiper;
