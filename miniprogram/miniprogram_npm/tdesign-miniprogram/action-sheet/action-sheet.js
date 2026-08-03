"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const utils_1 = require("../common/utils");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const show_1 = require("./show");
const props_1 = require("./props");
const using_custom_navbar_1 = require("../mixins/using-custom-navbar");
const using_config_1 = require("../mixins/using-config");
const { prefix: prefix } = config_1.default, componentName = "action-sheet";
let ActionSheet = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.behaviors = [using_custom_navbar_1.default, (0, using_config_1.default)({ componentName: componentName })], this.externalClasses = [`${prefix}-class`, `${prefix}-class-content`, `${prefix}-class-cancel`], this.properties = Object.assign({}, props_1.default), this.data = { prefix: prefix, classPrefix: `${prefix}-${componentName}`, gridThemeItems: [], currentSwiperIndex: 0, defaultPopUpProps: {}, defaultPopUpzIndex: 11500 }, this.controlledProps = [{ key: "visible", event: "visible-change" }], this.observers = { items() { this.splitGridThemeActions(); }, globalConfig() { this.updateInitialData(); } }, this.lifetimes = { ready() { this.init(); } }, this.methods = { init() { this.memoInitialData(), this.splitGridThemeActions(); }, memoInitialData() { this.updateInitialData(); }, updateInitialData() { this.initialData = Object.assign(Object.assign({}, this.properties), this.data); }, splitGridThemeActions() { this.data.theme === show_1.ActionSheetTheme.Grid && this.setData({ gridThemeItems: (0, utils_1.chunk)(this.data.items, this.data.count) }); }, show(e) { this.setData(Object.assign(Object.assign(Object.assign({}, this.initialData), e), { visible: !0 })), this.splitGridThemeActions(), this.autoClose = !0, this._trigger("visible-change", { visible: !0 }); }, close() { this.triggerEvent("close", { trigger: "command" }), this._trigger("visible-change", { visible: !1 }); }, onPopupVisibleChange({ detail: e }) { e.visible || (this.triggerEvent("close", { trigger: "overlay" }), this._trigger("visible-change", { visible: !1 })), this.autoClose && (this.setData({ visible: !1 }), this.autoClose = !1); }, onSwiperChange(e) { const { current: t } = e.detail; this.setData({ currentSwiperIndex: t }); }, onSelect(e) { const { currentSwiperIndex: t, items: i, gridThemeItems: s, count: o, theme: n } = this.data, { index: a } = e.currentTarget.dataset, r = n === show_1.ActionSheetTheme.Grid, h = r ? s[t][a] : i[a], c = r ? a + t * o : a; h && (this.triggerEvent("selected", { selected: h, index: c }), h.disabled || (this.triggerEvent("close", { trigger: "select" }), this._trigger("visible-change", { visible: !1 }))); }, onCancel() { this.triggerEvent("cancel"), this.autoClose && (this.setData({ visible: !1 }), this.autoClose = !1); } }; }
};
ActionSheet.show = show_1.show, ActionSheet = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], ActionSheet);
exports.default = ActionSheet;
