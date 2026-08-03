"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const config_store_1 = require("./config-store");
const utils_1 = require("./utils");
const { prefix: prefix } = config_1.default, componentName = "config-provider";
let ConfigProvider = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.options = { multipleSlots: !0 }, this.externalClasses = [`${prefix}-class`], this.properties = props_1.default, this.data = { prefix: prefix, classPrefix: `${prefix}-${componentName}`, cssVars: {} }, this.observers = { "themeVars, globalConfig"() { this.updateConfig(); } }, this.lifetimes = { attached() { this._componentId = `${Date.now()}-${Math.random().toString(36).slice(2)}`, this.initStore(), this.updateConfig(); }, detached() { this._unsubscribeLocale && this._unsubscribeLocale(), this._componentId && config_store_1.configStore.resetPageState(this._componentId); } }, this.methods = { initStore() { this._unsubscribeLocale = config_store_1.configStore.currentLocale.subscribe(() => { }); }, updateConfig() { const { themeVars: e, globalConfig: o } = this.properties; o && config_store_1.configStore.switchLocale(o, this._componentId), e && config_store_1.configStore.updateThemeVars(e), this.applyTheme(); }, applyTheme() { const { themeVars: e } = this.properties, o = (0, utils_1.default)(e || {}); this.setData({ cssVars: o }); } }; }
};
ConfigProvider = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], ConfigProvider);
exports.default = ConfigProvider;
