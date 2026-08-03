"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const transition_1 = require("../mixins/transition");
const using_custom_navbar_1 = require("../mixins/using-custom-navbar");
const { prefix: prefix } = config_1.default, name = `${prefix}-overlay`;
let Overlay = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.properties = props_1.default, this.behaviors = [(0, transition_1.default)(), using_custom_navbar_1.default], this.data = { prefix: prefix, classPrefix: name, computedStyle: "", _zIndex: 11e3 }, this.observers = { backgroundColor(o) { this.setData({ computedStyle: o ? `background-color: ${o};` : "" }); }, zIndex(o) { 0 !== o && this.setData({ _zIndex: o }); } }, this.methods = { handleClick() { this.triggerEvent("click", { visible: !this.properties.visible }); }, noop() { } }; }
};
Overlay = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Overlay);
exports.default = Overlay;
