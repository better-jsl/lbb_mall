"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const props_1 = require("./props");
const config_1 = require("../common/config");
const utils_1 = require("../common/utils");
const { prefix: prefix } = config_1.default, name = `${prefix}-result`, THEME_ICON = { default: "error-circle", success: "check-circle", warning: "error-circle", error: "close-circle" };
let default_1 = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.options = { multipleSlots: !0 }, this.externalClasses = [`${prefix}-class`, `${prefix}-class-image`, `${prefix}-class-title`, `${prefix}-class-description`], this.properties = props_1.default, this.data = { prefix: prefix, classPrefix: name }, this.lifetimes = { ready() { this.initIcon(); } }, this.observers = { "icon, theme"() { this.initIcon(); } }, this.methods = { initIcon() { const { icon: e, theme: o } = this.properties; this.setData({ _icon: (0, utils_1.calcIcon)(e, THEME_ICON[o]) }); } }; }
};
default_1 = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], default_1);
exports.default = default_1;
