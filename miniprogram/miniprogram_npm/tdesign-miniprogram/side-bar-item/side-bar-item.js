"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const { prefix: prefix } = config_1.default, name = `${prefix}-side-bar-item`;
let SideBarItem = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`], this.properties = Object.assign(Object.assign({}, props_1.default), { tId: { type: String } }), this.relations = { "../side-bar/side-bar": { type: "parent", linked(e) { this.parent = e, this.updateActive(e.data.value); } } }, this.observers = { icon(e) { this.setData({ _icon: "string" == typeof e ? { name: e } : e }); }, disabled(e) { this.setData({ active: !e && this.data.active }); } }, this.data = { classPrefix: name, prefix: prefix, active: !1, isPre: !1, isNext: !1 }, this.methods = { updateActive(e) { const t = e === this.data.value && !this.data.disabled; this.setData({ active: t }); }, handleClick() { var e; if (this.data.disabled)
            return; const { value: t, label: i } = this.data; null === (e = this.parent) || void 0 === e || e.doChange({ value: t, label: i }); } }; }
};
SideBarItem = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], SideBarItem);
exports.default = SideBarItem;
