"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const utils_1 = require("../common/utils");
const validator_1 = require("../common/validator");
const using_custom_navbar_1 = require("../mixins/using-custom-navbar");
const { prefix: prefix } = config_1.default, name = `${prefix}-dialog`;
let Dialog = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.behaviors = [using_custom_navbar_1.default], this.options = { multipleSlots: !0 }, this.externalClasses = [`${prefix}-class`, `${prefix}-class-content`, `${prefix}-class-confirm`, `${prefix}-class-cancel`, `${prefix}-class-action`], this.properties = props_1.default, this.data = { prefix: prefix, classPrefix: name, buttonVariant: "text" }, this.observers = { "confirmBtn, cancelBtn"(t, e) { const { prefix: o, classPrefix: i, buttonLayout: n } = this.data, s = { buttonVariant: "text" }, r = [t, e].some(t => (0, validator_1.isObject)(t) && t.variant && "text" !== t.variant), a = { confirm: t, cancel: e }, c = [`${i}__button`], l = []; r ? (s.buttonVariant = "base", c.push(`${i}__button--${n}`)) : (c.push(`${i}__button--text`), l.push(`${i}-button`)), Object.keys(a).forEach(t => { const e = a[t], n = { block: !0, rootClass: [...c, `${i}__button--${t}`], tClass: [...l, `${o}-class-${t}`], variant: s.buttonVariant, openType: "" }; "cancel" === t && "base" === s.buttonVariant && (n.theme = "light"), s[`_${t}`] = "string" == typeof e ? Object.assign(Object.assign({}, n), { content: e }) : e && "object" == typeof e ? Object.assign(Object.assign({}, n), e) : null; }), this.setData(Object.assign({}, s)); } }, this.methods = { onTplButtonTap(t) { var e, o, i; const n = t.type, { type: s, extra: r } = t.target.dataset, a = this.data[`_${s}`], c = `bind${n}`; if ("action" === s)
            return void this.onActionTap(r); if ("function" == typeof a[c]) {
            a[c](t) && this.close();
        } if (!!!a.openType && ["confirm", "cancel"].includes(s) && (null === (e = this[(0, utils_1.toCamel)(`on-${s}`)]) || void 0 === e || e.call(this, s)), "tap" !== n) {
            const e = (null === (i = null === (o = t.detail) || void 0 === o ? void 0 : o.errMsg) || void 0 === i ? void 0 : i.indexOf("ok")) > -1;
            this.triggerEvent(e ? "open-type-event" : "open-type-error-event", t.detail);
        } }, onConfirm() { this.triggerEvent("confirm"), this._onConfirm && (this._onConfirm({ trigger: "confirm" }), this.close()); }, onCancel() { const t = { trigger: "cancel" }; this.triggerEvent("cancel"), this.triggerEvent("close", t), this._onCancel && (this._onCancel(t), this.close()); }, onClose() { var t; const e = { trigger: "close-btn" }; this.triggerEvent("close", e), null === (t = this._onCancel) || void 0 === t || t.call(this, e), this.close(); }, close() { this.setData({ visible: !1 }); }, overlayClick() { var t; if (this.triggerEvent("overlay-click"), this.properties.closeOnOverlayClick) {
            const e = { trigger: "overlay" };
            this.triggerEvent("close", e), null === (t = this._onCancel) || void 0 === t || t.call(this, e), this.close();
        } }, onActionTap(t) { this.triggerEvent("action", { index: t }), this._onAction && (this._onAction({ index: t }), this.close()); }, openValueCBHandle(t) { this.triggerEvent("open-type-event", t.detail); }, openValueErrCBHandle(t) { this.triggerEvent("open-type-error-event", t.detail); } }; }
};
Dialog = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Dialog);
exports.default = Dialog;
