"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const use_config_1 = require("../config-provider/use-config");
const utils_1 = require("../common/utils");
const zh_CN_1 = require("../locale/zh_CN");
function usingConfig(o) { const { componentName: e, localeTextPropName: t } = o, a = (0, utils_1.toCamel)(e); return Behavior({ data: { globalConfig: {} }, lifetimes: { attached() { var o; null === (o = this.updateLocale) || void 0 === o || o.call(this); const e = (0, use_config_1.useConfig)(a); this._unsubscribeLocale = e.subscribeLocale(this, () => { var o; null === (o = this.updateLocale) || void 0 === o || o.call(this); }); }, detached() { const o = this._unsubscribeLocale; o && (o(), this._unsubscribeLocale = null); } }, methods: { updateLocale() { const o = zh_CN_1.default[a] || {}, e = (0, use_config_1.getComponentLocale)(this, a, o, t); this.setData({ globalConfig: e }); } } }); }
exports.default = usingConfig;
