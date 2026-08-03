"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const transition_1 = require("../mixins/transition");
const utils_1 = require("../common/utils");
const using_custom_navbar_1 = require("../mixins/using-custom-navbar");
const { prefix: prefix } = config_1.default, name = `${prefix}-toast`;
let Toast = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`], this.options = { multipleSlots: !0 }, this.behaviors = [(0, transition_1.default)(), using_custom_navbar_1.default], this.hideTimer = null, this.data = { prefix: prefix, classPrefix: name, typeMapIcon: "" }, this.properties = props_1.default, this.lifetimes = { detached() { this.destroyed(); } }, this.pageLifetimes = { hide() { this.hide(); } }, this.methods = { show(e) { this.hideTimer && clearTimeout(this.hideTimer); const i = { loading: "loading", success: "check-circle", warning: "error-circle", error: "close-circle" }[null == e ? void 0 : e.theme], t = { direction: props_1.default.direction.value, duration: props_1.default.duration.value, icon: props_1.default.icon.value, message: props_1.default.message.value, placement: props_1.default.placement.value, preventScrollThrough: props_1.default.preventScrollThrough.value, theme: props_1.default.theme.value, close: null }, o = Object.assign(Object.assign(Object.assign({}, t), e), { visible: !0, isLoading: "loading" === (null == e ? void 0 : e.theme), _icon: (0, utils_1.calcIcon)(null != i ? i : e.icon) }), { duration: s } = o; this.setData(o), s > 0 && (this.hideTimer = setTimeout(() => { this.hide(); }, s)); }, hide() { var e, i; this.data.visible && (this.setData({ visible: !1 }), null === (i = null === (e = this.data) || void 0 === e ? void 0 : e.close) || void 0 === i || i.call(e), this.triggerEvent("close")); }, destroyed() { this.hideTimer && (clearTimeout(this.hideTimer), this.hideTimer = null), this.triggerEvent("destory"); }, loop() { } }; }
};
Toast = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Toast);
exports.default = Toast;
