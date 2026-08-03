"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const { prefix: prefix } = config_1.default, name = `${prefix}-avatar-group`;
let AvatarGroup = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`, `${prefix}-class-content`, `${prefix}-class-image`], this.properties = props_1.default, this.data = { prefix: prefix, classPrefix: name, hasChild: !0, length: 0, className: "" }, this.options = { multipleSlots: !0 }, this.relations = { "../avatar/avatar": { type: "descendant" } }, this.lifetimes = { attached() { this.setClass(); }, ready() { this.setData({ length: this.$children.length }), this.handleMax(); } }, this.observers = { "cascading, size"() { this.setClass(); } }, this.methods = { setClass() { const { cascading: e, size: t } = this.properties, s = e.split("-")[0], a = [name, `${prefix}-class`, `${name}-offset-${s}`, `${name}-offset-${s}-${t.indexOf("px") > -1 ? "medium" : t || "medium"}`]; this.setData({ className: a.join(" ") }); }, handleMax() { const { max: e } = this.data, t = this.$children.length; if (!e || e > t)
            return; this.$children.splice(e, t - e).forEach(e => { e.hide(); }); }, onCollapsedItemClick(e) { this.triggerEvent("collapsed-item-click", e.detail); } }; }
};
AvatarGroup = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], AvatarGroup);
exports.default = AvatarGroup;
