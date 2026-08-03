"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const version_1 = require("../common/version");
const utils_1 = require("../common/utils");
const { prefix: prefix } = config_1.default, name = `${prefix}-button`;
let Button = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`, `${prefix}-class-icon`, `${prefix}-class-loading`], this.behaviors = (0, version_1.canIUseFormFieldButton)() ? ["wx://form-field-button"] : [], this.properties = props_1.default, this.options = { multipleSlots: !0 }, this.data = { prefix: prefix, className: "", classPrefix: name }, this.observers = { "theme, size, plain, block, shape, disabled, loading, variant"() { this.setClass(); }, icon(t) { this.setData({ _icon: (0, utils_1.calcIcon)(t, "") }); } }, this.lifetimes = { attached() { this.setClass(); } }, this.methods = { setClass() { const t = [name, `${prefix}-class`, `${name}--${this.data.variant || "base"}`, `${name}--${this.data.theme || "default"}`, `${name}--${this.data.shape || "rectangle"}`, `${name}--size-${this.data.size || "medium"}`]; this.data.block && t.push(`${name}--block`), this.data.disabled && t.push(`${name}--disabled`), this.data.ghost && t.push(`${name}--ghost`), this.setData({ className: t.join(" ") }); }, getuserinfo(t) { this.triggerEvent("getuserinfo", t.detail); }, contact(t) { this.triggerEvent("contact", t.detail); }, createliveactivity(t) { this.triggerEvent("createliveactivity", t.detail); }, getphonenumber(t) { this.triggerEvent("getphonenumber", t.detail); }, getrealtimephonenumber(t) { this.triggerEvent("getrealtimephonenumber", t.detail); }, error(t) { this.triggerEvent("error", t.detail); }, opensetting(t) { this.triggerEvent("opensetting", t.detail); }, launchapp(t) { this.triggerEvent("launchapp", t.detail); }, chooseavatar(t) { this.triggerEvent("chooseavatar", t.detail); }, agreeprivacyauthorization(t) { this.triggerEvent("agreeprivacyauthorization", t.detail); }, phoneoneclicklogin(t) { this.triggerEvent("phoneoneclicklogin", t.detail); }, handleTap(t) { this.data.disabled || this.data.loading || this.triggerEvent("tap", t); } }; }
};
Button = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Button);
exports.default = Button;
