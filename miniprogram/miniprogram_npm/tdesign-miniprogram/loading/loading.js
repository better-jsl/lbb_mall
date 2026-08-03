"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const { prefix: prefix } = config_1.default, name = `${prefix}-loading`;
let Loading = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`, `${prefix}-class-text`, `${prefix}-class-indicator`], this.data = { prefix: prefix, classPrefix: name, show: !0 }, this.options = { multipleSlots: !0 }, this.properties = Object.assign({}, props_1.default), this.timer = null, this.observers = { loading(e) { const { delay: t } = this.properties; this.timer && clearTimeout(this.timer), e && t ? this.timer = setTimeout(() => { this.setData({ show: e }), this.timer = null; }, t) : this.setData({ show: e }); } }, this.lifetimes = { detached() { clearTimeout(this.timer); } }; }
    refreshPage() { this.triggerEvent("reload"); }
};
Loading = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Loading);
exports.default = Loading;
