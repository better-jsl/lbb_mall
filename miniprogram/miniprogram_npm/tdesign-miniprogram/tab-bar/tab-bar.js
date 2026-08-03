"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const utils_1 = require("../common/utils");
const wechat_1 = require("../common/wechat");
const { prefix: prefix } = config_1.default, classPrefix = `${prefix}-tab-bar`;
function getSafeAreaBottom() { try {
    const e = (0, wechat_1.getWindowInfo)();
    if (e && e.safeArea && "number" == typeof e.screenHeight)
        return Math.max(0, e.screenHeight - e.safeArea.bottom);
}
catch (e) { } return 0; }
let Tabbar = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.relations = { "../tab-bar-item/tab-bar-item": { type: "descendant" } }, this.externalClasses = [`${prefix}-class`], this.backupValue = -1, this.data = { prefix: prefix, classPrefix: classPrefix, placeholderHeight: 56, safeAreaBottomHeight: 0, safeAreaBottomReady: !1 }, this.properties = props_1.default, this.controlledProps = [{ key: "value", event: "change" }], this.observers = { value() { this.updateChildren(); }, "fixed, placeholder, shape, safeAreaInsetBottom"() { this.setPlaceholderHeight(); }, safeAreaInsetBottom() { this.setSafeAreaBottomHeight(); } }, this.lifetimes = { ready() { this.showChildren(), this.setSafeAreaBottomHeight(); } }, this.methods = { setSafeAreaBottomHeight() { this.properties.safeAreaInsetBottom ? wx.nextTick(() => { const e = getSafeAreaBottom(); this.setData({ safeAreaBottomHeight: e, safeAreaBottomReady: !0 }, () => { this.setPlaceholderHeight(); }); }) : (this.data.safeAreaBottomReady || 0 !== this.data.safeAreaBottomHeight) && this.setData({ safeAreaBottomHeight: 0, safeAreaBottomReady: !1 }); }, setPlaceholderHeight() { this.properties.fixed && this.properties.placeholder && wx.nextTick(() => { (0, utils_1.getRect)(this, `.${classPrefix}`).then(e => { let { height: t } = e; "round" === this.properties.shape && this.properties.safeAreaInsetBottom && (t += getSafeAreaBottom()), this.setData({ placeholderHeight: t }); }); }); }, showChildren() { const { value: e } = this.data; this.$children.forEach(t => { t.setData({ crowded: this.$children.length > 3 }), t.properties.value === e && t.showSpread(); }); }, updateChildren() { const { value: e } = this.data; this.$children.forEach(t => { t.checkActive(e); }); }, updateValue(e) { this._trigger("change", { value: e }); }, changeOtherSpread(e) { this.$children.forEach(t => { t.properties.value !== e && t.closeSpread(); }); }, initName() { return this.backupValue += 1; } }; }
};
Tabbar = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Tabbar);
exports.default = Tabbar;
