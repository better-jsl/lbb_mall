"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const using_config_1 = require("../mixins/using-config");
const { prefix: prefix } = config_1.default, componentName = "chat-thinking";
let ChatThinking = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.behaviors = [(0, using_config_1.default)({ componentName: componentName })], this.options = { multipleSlots: !0 }, this.properties = props_1.default, this.data = { localCollapsed: !1, contentStyle: "", classPrefix: `${prefix}-${componentName}` }, this.observers = { maxHeight() { this.setContentStyle(); }, collapsed(t) { this.setData({ localCollapsed: t }); } }, this.methods = { handleCollapse() { this.setData({ localCollapsed: !this.data.localCollapsed }), this.triggerEvent("collapsedChange", this.data.localCollapsed); }, setContentStyle() { this.data.maxHeight ? this.setData({ contentStyle: `max-height: ${this.data.maxHeight}px;` }) : this.setData({ contentStyle: "" }); } }, this.lifetimes = { created() { this.data.handleCollapse = this.handleCollapse.bind(this); }, attached() { this.setData({ localCollapsed: this.properties.collapsed }), this.setContentStyle(); }, detached() { } }; }
};
ChatThinking = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], ChatThinking);
exports.default = ChatThinking;
