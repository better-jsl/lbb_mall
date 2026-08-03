"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const utils_1 = require("../common/utils");
const validator_1 = require("../common/validator");
const { prefix: prefix } = config_1.default, name = `${prefix}-tag`;
let Tag = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.data = { prefix: prefix, classPrefix: name, className: "", tagStyle: "" }, this.properties = props_1.default, this.externalClasses = [`${prefix}-class`], this.options = { multipleSlots: !0 }, this.lifetimes = { attached() { this.setClass(), this.setTagStyle(); } }, this.observers = { "size, shape, theme, variant, closable, disabled"() { this.setClass(); }, maxWidth() { this.setTagStyle(); }, icon(s) { this.setData({ _icon: (0, utils_1.calcIcon)(s) }); }, closable(s) { this.setData({ _closable: (0, utils_1.calcIcon)(s, "close") }); } }, this.methods = { setClass() { const { prefix: s, classPrefix: t } = this.data, { size: e, shape: a, theme: i, variant: o, closable: l, disabled: r } = this.properties, c = (0, utils_1.classNames)([t, `${t}--${i || "default"}`, `${t}--${o}`, l ? `${t}--closable ${s}-is-closable` : "", r ? `${t}--disabled ${s}-is-disabled` : "", `${t}--${e}`, `${t}--${a}`]); this.setData({ className: c }); }, setTagStyle() { const { maxWidth: s } = this.properties; if (!s)
            return ""; const t = (0, validator_1.isNumeric)(s) ? `${s}px` : s; this.setData({ tagStyle: `max-width:${t};` }); }, handleClick(s) { this.data.disabled || this.triggerEvent("click", s); }, handleClose(s) { this.data.disabled || this.triggerEvent("close", s); } }; }
};
Tag = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Tag);
exports.default = Tag;
