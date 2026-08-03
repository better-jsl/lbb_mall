"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const utils_1 = require("../common/utils");
const { prefix: prefix } = config_1.default, name = `${prefix}-textarea`;
let Textarea = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.options = { multipleSlots: !0 }, this.behaviors = ["wx://form-field"], this.externalClasses = [`${prefix}-class`, `${prefix}-class-textarea`, `${prefix}-class-label`, `${prefix}-class-indicator`], this.properties = props_1.default, this.data = { prefix: prefix, classPrefix: name, count: 0 }, this.observers = { value(e) { this.updateCount(null != e ? e : this.properties.defaultValue); } }, this.lifetimes = { ready() { var e; const { value: t, defaultValue: a } = this.properties; this.updateValue(null !== (e = null != t ? t : a) && void 0 !== e ? e : ""); } }, this.methods = { updateCount(e) { const { maxcharacter: t, maxlength: a } = this.properties, { count: r } = this.calculateValue(e, t, a); this.setData({ count: r }); }, updateValue(e) { const { maxcharacter: t, maxlength: a } = this.properties, { value: r, count: s } = this.calculateValue(e, t, a); this.setData({ value: r, count: s }); }, calculateValue(e, t, a) { const { allowInputOverMax: r } = this.properties; if (t > 0 && !Number.isNaN(t)) {
            const { length: a, characters: s } = (0, utils_1.getCharacterLength)("maxcharacter", e, r ? 1 / 0 : t);
            return { value: s, count: a };
        } if (a > 0 && !Number.isNaN(a)) {
            const { length: t, characters: s } = (0, utils_1.getCharacterLength)("maxlength", e, r ? 1 / 0 : a);
            return { value: s, count: t };
        } return { value: e, count: e ? String(e).length : 0 }; }, onInput(e) { const { value: t, cursor: a } = e.detail; this.updateValue(t), this.triggerEvent("change", { value: this.data.value, cursor: a }); }, onFocus(e) { this.triggerEvent("focus", Object.assign({}, e.detail)); }, onBlur(e) { this.triggerEvent("blur", Object.assign({}, e.detail)); }, onConfirm(e) { this.triggerEvent("enter", Object.assign({}, e.detail)); }, onLineChange(e) { this.triggerEvent("line-change", Object.assign({}, e.detail)); }, onKeyboardHeightChange(e) { this.triggerEvent("keyboardheightchange", e.detail); } }; }
};
Textarea = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Textarea);
exports.default = Textarea;
