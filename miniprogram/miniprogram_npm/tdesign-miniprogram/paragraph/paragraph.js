"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const using_config_1 = require("../mixins/using-config");
const { prefix: prefix } = config_1.default, componentName = "typography";
let Paragraph = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.behaviors = [(0, using_config_1.default)({ componentName: "typography" })], this.externalClasses = [`${prefix}-class`], this.options = { multipleSlots: !0 }, this.properties = props_1.default, this.data = { prefix: prefix, classPrefix: `${prefix}-typography`, isExpanded: !1 }, this.methods = { onExpand() { this.setData({ isExpanded: !0 }); const { ellipsis: e } = this.properties; "object" == typeof e && this.triggerEvent("expand", { expanded: !0 }); }, onCollapse() { this.setData({ isExpanded: !1 }); const { ellipsis: e } = this.properties; "object" == typeof e && this.triggerEvent("expand", { expanded: !1 }); } }; }
};
Paragraph = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Paragraph);
exports.default = Paragraph;
