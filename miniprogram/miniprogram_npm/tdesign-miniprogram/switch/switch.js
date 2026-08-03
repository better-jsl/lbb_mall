"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const { prefix: prefix } = config_1.default, name = `${prefix}-switch`;
let Switch = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`, `${prefix}-class-label`, `${prefix}-class-body`, `${prefix}-class-dot`], this.behaviors = ["wx://form-field"], this.properties = props_1.default, this.data = { prefix: prefix, classPrefix: name, checked: !1 }, this.controlledProps = [{ key: "value", event: "change" }], this.observers = { value(e) { const [t] = this.data.customValue; this.setData({ checked: e === t }); } }, this.methods = { handleSwitch() { const { loading: e, disabled: t, value: s, customValue: o } = this.data, [i, r] = o; e || t || this._trigger("change", { value: s === i ? r : i }); } }; }
};
Switch = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Switch);
exports.default = Switch;
