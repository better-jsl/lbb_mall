"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const props_1 = require("./props");
const config_1 = require("../common/config");
const page_scroll_1 = require("../mixins/page-scroll");
const utils_1 = require("../common/utils");
const { prefix: prefix } = config_1.default, name = `${prefix}-sticky`, ContainerClass = `.${name}`;
let Sticky = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`, `${prefix}-class-content`], this.properties = props_1.default, this.behaviors = [(0, page_scroll_1.default)()], this.observers = { "offsetTop, disabled, container"() { this.onScroll(); } }, this.data = { prefix: prefix, classPrefix: name, containerStyle: "", contentStyle: "" }, this.methods = { onScroll(t) { const { scrollTop: e } = t || {}, { container: i, offsetTop: o, disabled: s } = this.properties; s ? this.setDataAfterDiff({ isFixed: !1, transform: 0 }) : (this.scrollTop = e || this.scrollTop, "function" != typeof i ? (0, utils_1.getRect)(this, ContainerClass).then(t => { t && (o >= t.top ? (this.setDataAfterDiff({ isFixed: !0, height: t.height }), this.transform = 0) : this.setDataAfterDiff({ isFixed: !1 })); }) : Promise.all([(0, utils_1.getRect)(this, ContainerClass), this.getContainerRect()]).then(([t, e]) => { t && e && (o + t.height > e.height + e.top ? this.setDataAfterDiff({ isFixed: !1, transform: e.height - t.height }) : o >= t.top ? this.setDataAfterDiff({ isFixed: !0, height: t.height, transform: 0 }) : this.setDataAfterDiff({ isFixed: !1, transform: 0 })); })); }, setDataAfterDiff(t) { const { offsetTop: e } = this.properties, { containerStyle: i, contentStyle: o } = this.data, { isFixed: s, height: r, transform: n } = t; wx.nextTick(() => { let t = "", a = ""; if (s && (t += `height:${r}px;`, a += `position:fixed;top:${e}px;left:0;right:0;`), n) {
            const t = `translate3d(0, ${n}px, 0)`;
            a += `-webkit-transform:${t};transform:${t};`;
        } i === t && o === a || this.setData({ containerStyle: t, contentStyle: a }), this.triggerEvent("scroll", { scrollTop: this.scrollTop, isFixed: s }); }); }, getContainerRect() { const t = this.properties.container(); return new Promise(e => t.boundingClientRect(e).exec()); } }; }
    ready() { this.onScroll(); }
};
Sticky = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Sticky);
exports.default = Sticky;
