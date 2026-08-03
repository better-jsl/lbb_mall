"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const transition_1 = require("../mixins/transition");
const using_custom_navbar_1 = require("../mixins/using-custom-navbar");
delete props_1.default.visible;
const { prefix: prefix } = config_1.default, name = `${prefix}-popup`;
let Popup = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`, `${prefix}-class-content`], this.behaviors = [(0, transition_1.default)(), using_custom_navbar_1.default], this.options = { multipleSlots: !0 }, this.properties = props_1.default, this.data = { prefix: prefix, classPrefix: name }, this.methods = { handleOverlayClick() { const { closeOnOverlayClick: e } = this.properties; e && this.triggerEvent("visible-change", { visible: !1, trigger: "overlay" }); }, handleClose() { this.triggerEvent("visible-change", { visible: !1, trigger: "close-btn" }); } }; }
};
Popup = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Popup);
exports.default = Popup;
