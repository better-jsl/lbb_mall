"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const validator_1 = require("../common/validator");
const props_1 = require("./props");
const { prefix: prefix } = config_1.default, name = `${prefix}-grid`;
let Grid = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = ["t-class"], this.relations = { "../grid-item/grid-item": { type: "descendant" } }, this.properties = props_1.default, this.data = { prefix: prefix, classPrefix: name, contentStyle: "" }, this.observers = { "column,hover,align,gutter,border"() { this.updateContentStyle(), this.doForChild(t => t.updateStyle()); } }, this.lifetimes = { attached() { this.updateContentStyle(); } }, this.methods = { doForChild(t) { this.$children.forEach(t); }, updateContentStyle() { const t = [], e = this.getContentMargin(); e && t.push(e), this.setData({ contentStyle: t.join(";") }); }, getContentMargin() { const { gutter: t } = this.properties; let { border: e } = this.properties; if (!e)
            return `margin-bottom:-${t}rpx; margin-right:-${t}rpx`; (0, validator_1.isObject)(e) || (e = {}); const { width: r = 2 } = e; return `margin-bottom:-${r}rpx; margin-right:-${r}rpx`; } }; }
};
Grid = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Grid);
exports.default = Grid;
