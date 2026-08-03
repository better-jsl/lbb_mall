"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const utils_1 = require("../common/utils");
const { prefix: prefix } = config_1.default, classPrefix = `${prefix}-tab-bar-item`;
let TabBarItem = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`], this.parent = null, this.relations = { "../tab-bar/tab-bar": { type: "ancestor", linked(t) { const { theme: e, split: a, shape: s } = t.data; this.setData({ theme: e, split: a, shape: s, currentName: this.properties.value ? this.properties.value : t.initName() }), t.updateChildren(); } } }, this.options = { multipleSlots: !0 }, this.data = { prefix: prefix, classPrefix: classPrefix, isSpread: !1, isChecked: !1, hasChildren: !1, currentName: "", split: !0, iconOnly: !1, theme: "", crowded: !1, shape: "normal" }, this.properties = props_1.default, this.observers = { subTabBar(t) { this.setData({ hasChildren: t.length > 0 }); }, icon(t) { this.setData({ _icon: (0, utils_1.calcIcon)(t) }); } }, this.lifetimes = { attached() { return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () { const t = yield (0, utils_1.getRect)(this, `.${classPrefix}__text`); this.setData({ iconOnly: 0 === t.height }); }); } }, this.methods = { showSpread() { this.setData({ isSpread: !0 }); }, toggle() { const { currentName: t, hasChildren: e, isSpread: a, url: s, linkType: i } = this.data; e && this.setData({ isSpread: !a }), this.$parent.updateValue(t), this.$parent.changeOtherSpread(t), s && wx[i] && wx[i]({ url: s }); }, selectChild(t) { const { value: e } = t.target.dataset; this.$parent.updateValue(e), this.setData({ isSpread: !1 }); }, checkActive(t) { const { currentName: e, subTabBar: a } = this.data, s = (null == a ? void 0 : a.some(e => e.value === t)) || e === t; this.setData({ isChecked: s }); }, closeSpread() { this.setData({ isSpread: !1 }); } }; }
};
TabBarItem = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], TabBarItem);
exports.default = TabBarItem;
