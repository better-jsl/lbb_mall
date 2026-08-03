"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const utils_1 = require("../common/utils");
const { prefix: prefix } = config_1.default, name = `${prefix}-link`;
let Link = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`, `${prefix}-class-hover`, `${prefix}-class-prefix-icon`, `${prefix}-class-content`, `${prefix}-class-suffix-icon`], this.properties = props_1.default, this.options = { multipleSlots: !0 }, this.data = { prefix: prefix, classPrefix: name }, this.observers = { "theme, disabled, size, underline, navigatorProps"() { this.setClass(); }, prefixIcon(e) { this.setData({ _prefixIcon: (0, utils_1.calcIcon)(e) }); }, suffixIcon(e) { this.setData({ _suffixIcon: (0, utils_1.calcIcon)(e) }); } }, this.lifetimes = { attached() { this.setClass(); } }, this.methods = { setClass() { const { theme: e, size: s, underline: i, navigatorProps: t, disabled: o } = this.properties, n = [name, `${name}--${e}`, `${name}--${s}`], { url: r, appId: a, shortLink: p, target: c, openType: l } = null != t ? t : {}, m = !(r || "miniProgram" === c && (a || p)); i && n.push(`${name}--underline`), (t && m && !["navigateBack", "exit"].includes(l) || o) && n.push(`${name}--disabled`), this.setData({ className: n.join(" ") }); }, onSuccess(e) { this.triggerEvent("success", e); }, onFail(e) { this.triggerEvent("fail", e); }, onComplete(e) { this.triggerEvent("complete", e); } }; }
};
Link = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Link);
exports.default = Link;
