"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const utils_1 = require("../common/utils");
const { prefix: prefix } = config_1.default, name = `${prefix}-search`;
let Search = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`, `${prefix}-class-input-container`, `${prefix}-class-input`, `${prefix}-class-action`, `${prefix}-class-left`, `${prefix}-class-clear`], this.options = { multipleSlots: !0 }, this.properties = props_1.default, this.observers = { resultList(e) { const { isSelected: t } = this.data; e.length && t && this.setData({ isSelected: !1 }); }, "clearTrigger, clearable, disabled, readonly"() { this.updateClearIconVisible(); } }, this.data = { classPrefix: name, prefix: prefix, isSelected: !1, isSearching: !1, showClearIcon: !0 }; }
    updateClearIconVisible(e = !1) { const { clearTrigger: t, disabled: r, readonly: i } = this.properties; r || i ? this.setData({ showClearIcon: !1 }) : this.setData({ showClearIcon: e || "always" === String(t) }); }
    onInput(e) { let { value: t } = e.detail; const { maxcharacter: r } = this.properties; if (r && "number" == typeof r && r > 0) {
        const { characters: e } = (0, utils_1.getCharacterLength)("maxcharacter", t, r);
        t = e;
    } this.setData({ value: t }), this.triggerEvent("change", { value: t, trigger: "input-change" }); }
    onFocus(e) { const { value: t } = e.detail; this.setData({ isSearching: !0 }), this.updateClearIconVisible(!0), this.triggerEvent("focus", { value: t }); }
    onBlur(e) { const { value: t } = e.detail; this.updateClearIconVisible(), this.triggerEvent("blur", { value: t }); }
    handleClear() { this.setData({ value: "", isSearching: !1 }), this.triggerEvent("clear", { value: "" }), this.triggerEvent("change", { value: "", trigger: "clear" }); }
    onConfirm(e) { const { value: t } = e.detail; this.triggerEvent("submit", { value: t }); }
    onActionClick() { this.setData({ isSearching: !1 }), this.triggerEvent("action-click"); }
    onSelectOption(e) { const { index: t } = e.currentTarget.dataset, r = this.properties.resultList[t]; this.setData({ value: r, isSelected: !0 }), this.triggerEvent("change", { value: r, trigger: "option-click" }); }
};
Search = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Search);
exports.default = Search;
