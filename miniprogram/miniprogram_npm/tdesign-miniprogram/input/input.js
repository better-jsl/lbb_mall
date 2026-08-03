"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const utils_1 = require("../common/utils");
const validator_1 = require("../common/validator");
const { prefix: prefix } = config_1.default, name = `${prefix}-input`;
let Input = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.options = { multipleSlots: !0 }, this.externalClasses = [`${prefix}-class`, `${prefix}-class-prefix-icon`, `${prefix}-class-label`, `${prefix}-class-input`, `${prefix}-class-clearable`, `${prefix}-class-suffix`, `${prefix}-class-suffix-icon`, `${prefix}-class-tips`], this.behaviors = ["wx://form-field"], this.properties = props_1.default, this.data = { prefix: prefix, classPrefix: name, classBasePrefix: prefix, showClearIcon: !0 }, this.lifetimes = { ready() { var e; const { value: t, defaultValue: i } = this.properties; this.updateValue(null !== (e = null != t ? t : i) && void 0 !== e ? e : ""); } }, this.observers = { prefixIcon(e) { this.setData({ _prefixIcon: (0, utils_1.calcIcon)(e) }); }, suffixIcon(e) { this.setData({ _suffixIcon: (0, utils_1.calcIcon)(e) }); }, clearable(e) { this.setData({ _clearIcon: (0, utils_1.calcIcon)(e, "close-circle-filled") }); }, "clearTrigger, clearable, disabled, readonly"() { this.updateClearIconVisible(); } }, this.methods = { updateValue(e) { const { allowInputOverMax: t, maxcharacter: i, maxlength: a } = this.properties; if (!t && i && i > 0 && !Number.isNaN(i)) {
            const { length: t, characters: a } = (0, utils_1.getCharacterLength)("maxcharacter", e, i);
            this.setData({ value: a, count: t });
        }
        else if (!t && a && a > 0 && !Number.isNaN(a)) {
            const { length: t, characters: i } = (0, utils_1.getCharacterLength)("maxlength", e, a);
            this.setData({ value: i, count: t });
        }
        else
            this.setData({ value: e, count: (0, validator_1.isDef)(e) ? String(e).length : 0 }); }, updateClearIconVisible(e = !1) { const { clearTrigger: t, disabled: i, readonly: a } = this.properties; i || a ? this.setData({ showClearIcon: !1 }) : this.setData({ showClearIcon: e || "always" === t }); }, onInput(e) { const { value: t, cursor: i, keyCode: a } = e.detail; this.updateValue(t), this.triggerEvent("change", { value: this.data.value, cursor: i, keyCode: a }); }, onChange(e) { if ("nickname" !== this.properties.type)
            return; const { value: t } = e.detail; this.updateValue(t), this.triggerEvent("change", { value: this.data.value }); }, onFocus(e) { this.updateClearIconVisible(!0), this.triggerEvent("focus", e.detail); }, onBlur(e) { if (this.updateClearIconVisible(), "function" == typeof this.properties.format) {
            const t = this.properties.format(e.detail.value);
            return this.updateValue(t), void this.triggerEvent("blur", { value: this.data.value, cursor: this.data.count });
        } this.triggerEvent("blur", e.detail); }, onConfirm(e) { this.triggerEvent("enter", e.detail); }, onSuffixClick() { this.triggerEvent("click", { trigger: "suffix" }); }, onSuffixIconClick() { this.triggerEvent("click", { trigger: "suffix-icon" }); }, clearInput(e) { this.triggerEvent("clear", e.detail), this.setData({ value: "" }); }, onKeyboardHeightChange(e) { this.triggerEvent("keyboardheightchange", e.detail); }, onNickNameReview(e) { this.triggerEvent("nicknamereview", e.detail); } }; }
};
Input = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Input);
exports.default = Input;
