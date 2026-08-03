"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const { prefix: prefix } = config_1.default, name = `${prefix}-checkbox`;
let CheckBox = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`, `${prefix}-class-label`, `${prefix}-class-icon`, `${prefix}-class-content`, `${prefix}-class-border`], this.behaviors = ["wx://form-field"], this.relations = { "../checkbox-group/checkbox-group": { type: "ancestor", linked(e) { const { value: t, disabled: s, borderless: a } = e.data, i = new Set(t), o = i.has(this.data.value), c = { _disabled: null == this.data.disabled ? s : this.data.disabled }; a && (c.borderless = !0), c.checked = this.data.checked || o, this.data.checked && e.updateValue(this.data), this.data.checkAll && (c.checked = i.size > 0), this.setData(c); } } }, this.options = { multipleSlots: !0 }, this.properties = Object.assign(Object.assign({}, props_1.default), { theme: { type: String, value: "default" }, tId: { type: String } }), this.data = { prefix: prefix, classPrefix: name, _disabled: !1 }, this.observers = { disabled(e) { this.setData({ _disabled: e }); } }, this.controlledProps = [{ key: "checked", event: "change" }], this.methods = { handleTap(e) { const { _disabled: t, readonly: s, contentDisabled: a } = this.data, { target: i } = e.currentTarget.dataset; if (t || s || "text" === i && a)
            return; const { value: o, label: c } = this.data, d = !this.data.checked, r = this.$parent; r ? r.updateValue(Object.assign(Object.assign({}, this.data), { checked: d, item: { label: c, value: o, checked: d } })) : this._trigger("change", { context: { value: o, label: c }, checked: d }); }, setDisabled(e) { this.setData({ _disabled: this.data.disabled || e }); } }; }
};
CheckBox = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], CheckBox);
exports.default = CheckBox;
