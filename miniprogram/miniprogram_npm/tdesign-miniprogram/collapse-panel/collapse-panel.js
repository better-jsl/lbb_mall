"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const utils_1 = require("../common/utils");
const { prefix: prefix } = config_1.default, name = `${prefix}-collapse-panel`;
let CollapsePanel = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`, `${prefix}-class-content`, `${prefix}-class-header`], this.options = { multipleSlots: !0 }, this.relations = { "../collapse/collapse": { type: "ancestor", linked(e) { const { value: t, expandIcon: a, disabled: s } = e.properties; this.setData({ ultimateExpandIcon: null == this.properties.expandIcon ? a : this.properties.expandIcon, ultimateDisabled: null == this.properties.disabled ? s : this.properties.disabled }), this.updateExpanded(t); } } }, this.properties = props_1.default, this.data = { prefix: prefix, expanded: !1, classPrefix: name, classBasePrefix: prefix, ultimateExpandIcon: !1, ultimateDisabled: !1 }, this.observers = { disabled(e) { this.setData({ ultimateDisabled: !!e }); } }, this.methods = { updateExpanded(e = []) { if (!this.$parent)
            return; const { value: t } = this.properties, { defaultExpandAll: a } = this.$parent.data, s = a ? !this.data.expanded : e.includes(t); s !== this.properties.expanded && (this.setData({ expanded: s }), this.updateStyle(s)); }, updateStyle(e) { return (0, utils_1.getRect)(this, `.${name}__content`).then(e => e.height).then(t => { const a = wx.createAnimation({ duration: 0, timingFunction: "ease-in-out" }); e ? a.height(t).top(0).step({ duration: 300 }).height("auto").step() : a.height(t).top(1).step({ duration: 1 }).height(0).step({ duration: 300 }), this.setData({ animation: a.export() }); }); }, onClick() { const { ultimateDisabled: e } = this.data, { value: t } = this.properties; e || (this.$parent.data.defaultExpandAll ? this.updateExpanded() : this.$parent.switch(t)); } }; }
};
CollapsePanel = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], CollapsePanel);
exports.default = CollapsePanel;
