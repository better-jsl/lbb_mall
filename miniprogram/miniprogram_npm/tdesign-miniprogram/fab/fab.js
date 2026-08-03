"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const using_custom_navbar_1 = require("../mixins/using-custom-navbar");
const utils_1 = require("../common/utils");
const { prefix: prefix } = config_1.default, name = `${prefix}-fab`, baseButtonProps = { size: "large", shape: "circle", theme: "primary", tClass: `${prefix}-fab__button` };
let Fab = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.behaviors = [using_custom_navbar_1.default], this.properties = props_1.default, this.externalClasses = ["class", `${prefix}-class`, `${prefix}-class-button`], this.data = { prefix: prefix, classPrefix: name, buttonData: baseButtonProps, moveStyle: null }, this.observers = { "buttonProps.**, icon, text, ariaLabel, yBounds"() { var t; this.setData({ buttonData: Object.assign(Object.assign(Object.assign(Object.assign({}, baseButtonProps), { shape: this.properties.text ? "round" : "circle" }), this.properties.buttonProps), { icon: (0, utils_1.calcIcon)(this.properties.icon), content: this.properties.text, ariaLabel: this.properties.ariaLabel }) }, null === (t = this.computedSize) || void 0 === t ? void 0 : t.bind(this)); } }, this.methods = { onTplButtonTap(t) { this.triggerEvent("click", t); }, onStart(t) { this.triggerEvent("dragstart", t.detail.e); }, onMove(t) { const { yBounds: e } = this.properties, { distanceTop: o } = this.data, { x: s, y: i, rect: r } = t.detail, a = utils_1.systemInfo.windowWidth - r.width, n = utils_1.systemInfo.windowHeight - Math.max(o, (0, utils_1.unitConvert)(e[0])) - r.height, p = Math.max(0, Math.min(s, a)), c = Math.max(0, (0, utils_1.unitConvert)(e[1]), Math.min(i, n)); this.setData({ moveStyle: `right: ${p}px; bottom: ${c}px;` }); }, onEnd(t) { this.triggerEvent("dragend", t.detail.e); }, computedSize() { var t, e; if (!this.properties.draggable)
            return; const o = this.selectComponent("#draggable"); (null === (e = null === (t = this.properties) || void 0 === t ? void 0 : t.yBounds) || void 0 === e ? void 0 : e[1]) ? this.setData({ moveStyle: `bottom: ${(0, utils_1.unitConvert)(this.properties.yBounds[1])}px` }, o.computedRect) : o.computedRect(); } }; }
};
Fab = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Fab);
exports.default = Fab;
