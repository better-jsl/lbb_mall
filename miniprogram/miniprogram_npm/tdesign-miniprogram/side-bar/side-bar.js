"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const { prefix: prefix } = config_1.default, name = `${prefix}-side-bar`;
let SideBar = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`], this.children = [], this.relations = { "../side-bar-item/side-bar-item": { type: "child", linked(e) { this.children.push(e); }, unlinked(e) { const i = this.children.findIndex(i => i === e); this.children.splice(i, 1); } } }, this.controlledProps = [{ key: "value", event: "change" }], this.properties = props_1.default, this.observers = { value(e) { const i = this.$children; i.forEach((r, t) => { r.updateActive(e), r.setData({ isFirstChild: 0 === t, isLastChild: t === i.length - 1 }); }); } }, this.data = { classPrefix: name, prefix: prefix }, this.methods = { doChange({ value: e, label: i }) { this._trigger("change", { value: e, label: i }); } }; }
};
SideBar = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], SideBar);
exports.default = SideBar;
