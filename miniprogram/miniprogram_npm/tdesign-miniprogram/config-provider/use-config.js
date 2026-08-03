"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useConfig = exports.getComponentLocale = void 0;
const config_store_1 = require("./config-store");
function getComponentLocale(e, o, t, n) { var r; let c = {}; n && (c = (null === (r = e.properties) || void 0 === r ? void 0 : r[n]) || {}); const i = config_store_1.configStore.currentLocale.value, s = i && i[o] || {}; return Object.assign(Object.assign(Object.assign({}, t), s), c); }
exports.getComponentLocale = getComponentLocale;
function useConfig(e) { return { getLocale: (o, t) => getComponentLocale(t, e, o), subscribeLocale: (e, o) => config_store_1.configStore.currentLocale.subscribe(e => { o(e); }) }; }
exports.useConfig = useConfig;
