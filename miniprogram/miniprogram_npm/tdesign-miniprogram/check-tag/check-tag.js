"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const utils_1 = require("../common/utils");
const { prefix: prefix } = config_1.default, name = `${prefix}-tag`;
let CheckTag = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.data = { prefix: prefix, classPrefix: name, className: "" }, this.properties = props_1.default, this.externalClasses = [`${prefix}-class`], this.controlledProps = [{ key: "checked", event: "change" }], this.options = { multipleSlots: !0 }, this.lifetimes = { attached() { this.setClass(); } }, this.observers = { "size, disabled, checked"() { this.setClass(); }, icon(e) { this.setData({ _icon: (0, utils_1.calcIcon)(e) }); } }, this.methods = { setClass() { const { classPrefix: e } = this.data, { size: s, variant: t, disabled: i, checked: a, shape: c } = this.properties, o = (0, utils_1.classNames)([e, `${e}--checkable`, i ? `${e}--disabled` : "", a ? `${e}--checked` : "", `${e}--${a ? "primary" : "default"}`, `${e}--${s}`, `${e}--${t}`, `${e}--${c}`]); this.setData({ className: o }); }, onClick() { if (this.data.disabled)
            return; const { checked: e } = this.data; this._trigger("click"), this._trigger("change", { checked: !e }); }, onClose(e) { this.data.disabled || this._trigger("close", e); } }; }
};
CheckTag = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], CheckTag);
exports.default = CheckTag;
