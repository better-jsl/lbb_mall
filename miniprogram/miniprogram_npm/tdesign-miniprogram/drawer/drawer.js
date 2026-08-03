"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const using_custom_navbar_1 = require("../mixins/using-custom-navbar");
const { prefix: prefix } = config_1.default, name = `${prefix}-drawer`;
let Drawer = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.behaviors = [using_custom_navbar_1.default], this.externalClasses = [], this.options = { multipleSlots: !0 }, this.properties = props_1.default, this.data = { classPrefix: name }, this.methods = { onVisibleChange({ detail: e }) { const { visible: t } = e, { showOverlay: r } = this.data; this.setData({ visible: t }), t || this.triggerEvent("close", { trigger: "overlay" }), r && this.triggerEvent("overlay-click", { visible: t }); }, onItemClick(e) { const { index: t, item: r } = e.currentTarget.dataset; this.triggerEvent("item-click", { index: t, item: r }); } }; }
};
Drawer = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Drawer);
exports.default = Drawer;
