"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const utils_1 = require("../common/utils");
const { prefix: prefix } = config_1.default, componentName = "dropdown-menu";
let DropdownMenu = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`, `${prefix}-class-item`, `${prefix}-class-label`, `${prefix}-class-icon`], this.properties = props_1.default, this.nodes = null, this.data = { prefix: prefix, classPrefix: `${prefix}-${componentName}`, menus: null, activeIdx: -1, bottom: 0, _arrowIcon: { name: props_1.default.arrowIcon.value } }, this.relations = { "../dropdown-item/dropdown-item": { type: "child" } }, this.lifetimes = { ready() { this.getAllItems(); } }, this.observers = { arrowIcon(e) { this.setData({ _arrowIcon: (0, utils_1.calcIcon)(e) }); }, activeIdx(e) { this.triggerEvent(-1 === e ? "close" : "open"); } }, this.methods = { toggle(e) { const { activeIdx: t, duration: o } = this.data, s = this.$children[t], r = this.$children[e]; (null == r ? void 0 : r.data.disabled) || (-1 !== t && (s.triggerEvent("close"), s.setData({ show: !1 }, () => { setTimeout(() => { s.triggerEvent("closed"); }, o); })), null == e || t === e ? this.setData({ activeIdx: -1 }) : (r.triggerEvent("open"), this.setData({ activeIdx: e }), r.setData({ show: !0 }, () => { setTimeout(() => { r.triggerEvent("opened"); }, o); }))); }, getAllItems() { const e = this.$children.map(({ data: e }) => ({ label: e.computedLabel || e.label, disabled: e.disabled })); this.setData({ menus: e }); }, handleToggle(e) { const { index: t } = e.currentTarget.dataset; this.toggle(t); }, noop() { } }; }
};
DropdownMenu = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], DropdownMenu);
exports.default = DropdownMenu;
