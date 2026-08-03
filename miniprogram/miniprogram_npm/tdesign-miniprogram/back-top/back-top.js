"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const utils_1 = require("../common/utils");
const { prefix: prefix } = config_1.default, name = `${prefix}-back-top`;
let BackTop = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`, `${prefix}-class-icon`, `${prefix}-class-text`], this.options = { multipleSlots: !0 }, this.properties = props_1.default, this.relations = { "../pull-down-refresh/pull-down-refresh": { type: "ancestor" } }, this.data = { prefix: prefix, classPrefix: name, _icon: null, hidden: !0 }, this.observers = { icon() { this.setIcon(); }, scrollTop(o) { const { visibilityHeight: t } = this.properties; this.setData({ hidden: o < t }); } }, this.lifetimes = { ready() { const { icon: o } = this.properties; this.setIcon(o); } }, this.methods = { setIcon(o) { this.setData({ _icon: (0, utils_1.calcIcon)(o, "backtop") }); }, toTop() { var o; this.triggerEvent("to-top"), this.$parent ? (null === (o = this.$parent) || void 0 === o || o.setScrollTop(0), this.setData({ hidden: !0 })) : wx.pageScrollTo({ scrollTop: 0, duration: 300 }); } }; }
};
BackTop = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], BackTop);
exports.default = BackTop;
