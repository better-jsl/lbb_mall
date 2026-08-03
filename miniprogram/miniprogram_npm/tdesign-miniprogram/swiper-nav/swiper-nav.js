"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const { prefix: prefix } = config_1.default, name = `${prefix}-swiper-nav`;
let SwiperNav = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`], this.properties = { current: { type: Number, value: 0 }, total: { type: Number, value: 0 }, type: { type: String, value: "dots" }, minShowNum: { type: Number, value: 2 }, showControls: { type: Boolean, value: !1 }, direction: { type: String, value: "horizontal" }, paginationPosition: { type: String, value: "bottom" } }, this.relations = { "../swiper/swiper": { type: "parent" } }, this.data = { prefix: prefix, classPrefix: name }, this.methods = { nav(e) { var t; const { dir: r } = e.target.dataset; this.triggerEvent("nav-btn-change", { dir: r, source: "nav" }), this.$parent && (null === (t = this.$parent) || void 0 === t || t.doNavBtnChange(r, "nav")); } }; }
};
SwiperNav = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], SwiperNav);
exports.default = SwiperNav;
