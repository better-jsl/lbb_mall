"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const utils_1 = require("../common/utils");
const { prefix: prefix } = config_1.default, name = `${prefix}-avatar`;
let Avatar = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.options = { multipleSlots: !0 }, this.externalClasses = [`${prefix}-class`, `${prefix}-class-image`, `${prefix}-class-icon`, `${prefix}-class-alt`, `${prefix}-class-content`], this.properties = props_1.default, this.data = { prefix: prefix, classPrefix: name, isShow: !0, zIndex: 0, windowWidth: utils_1.systemInfo.windowWidth }, this.relations = { "../avatar-group/avatar-group": { type: "ancestor", linked(t) { this.parent = t, this.setData({ shape: this.data.shape || t.data.shape || "circle", size: this.data.size || t.data.size, bordered: !0 }); } } }, this.observers = { icon(t) { const e = (0, utils_1.setIcon)("icon", t, ""); this.setData(Object.assign({}, e)); } }, this.methods = { hide() { this.setData({ isShow: !1 }); }, onLoadError(t) { this.properties.hideOnLoadFailed && this.setData({ isShow: !1 }), this.triggerEvent("error", t.detail); } }; }
};
Avatar = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Avatar);
exports.default = Avatar;
