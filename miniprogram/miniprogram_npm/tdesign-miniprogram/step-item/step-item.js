"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const { prefix: prefix } = config_1.default, name = `${prefix}-steps-item`;
let StepItem = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.options = { multipleSlots: !0 }, this.relations = { "../steps/steps": { type: "parent" } }, this.externalClasses = [`${prefix}-class`, `${prefix}-class-content`, `${prefix}-class-title`, `${prefix}-class-description`, `${prefix}-class-extra`], this.properties = props_1.default, this.data = { classPrefix: name, prefix: prefix, index: 0, isDot: !1, curStatus: "", layout: "vertical", isLastChild: !1, sequence: "positive" }, this.observers = { status(t) { const { curStatus: e } = this.data; "" !== e && t !== e && this.setData({ curStatus: t }); } }, this.methods = { updateStatus({ current: t, currentStatus: e, index: s, theme: i, layout: r, items: o, sequence: a }) { let p = this.data.status; "default" === p && (s < Number(t) ? p = "finish" : s === Number(t) && (p = e)), this.setData({ curStatus: p, index: s, isDot: "dot" === i, layout: r, theme: i, sequence: a, isLastChild: s === ("positive" === a ? o.length - 1 : 0) }); }, onTap() { this.$parent.handleClick(this.data.index); } }; }
};
StepItem = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], StepItem);
exports.default = StepItem;
