"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const using_config_1 = require("../mixins/using-config");
const { prefix: prefix } = config_1.default, componentName = "typography";
let Text = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.behaviors = [(0, using_config_1.default)({ componentName: "typography" })], this.externalClasses = [`${prefix}-class`, `${prefix}-class-copy`], this.options = { multipleSlots: !0 }, this.properties = props_1.default, this.data = { prefix: prefix, classPrefix: `${prefix}-typography`, className: "", _delete: !1, isExpanded: !1, isCopied: !1 }, this.lifetimes = { attached() { this.updateClass(); } }, this.observers = { "theme, disabled"() { this.updateClass(); }, delete(e) { this.setData({ _delete: e }); } }, this.methods = { updateClass() { const { classPrefix: e } = this.data, { theme: t, disabled: s } = this.properties, i = [e]; s ? i.push(`${e}--disabled`) : t && ["primary", "secondary", "success", "warning", "error"].includes(t) && i.push(`${e}--${t}`), this.setData({ className: i.join(" ") }); }, onExpand() { this.setData({ isExpanded: !0 }); const { ellipsis: e } = this.properties; "object" == typeof e && this.triggerEvent("expand", { expanded: !0 }); }, onCollapse() { this.setData({ isExpanded: !1 }); const { ellipsis: e } = this.properties; "object" == typeof e && this.triggerEvent("expand", { expanded: !1 }); }, onCopy() { if (this.data.isCopied)
            return; const { copyable: e, content: t } = this.properties; let s = t || ""; "object" == typeof e && null !== e && e.text && (s = e.text), wx.setClipboardData({ data: s, success: () => { this.setData({ isCopied: !0 }), this.triggerEvent("copy", { text: s }), setTimeout(() => { this.setData({ isCopied: !1 }); }, 1500); } }); } }; }
};
Text = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Text);
exports.default = Text;
