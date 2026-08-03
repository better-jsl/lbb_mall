"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const { prefix: prefix } = config_1.default;
let Row = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [], this.properties = props_1.default, this.data = { prefix: prefix }, this.relations = { "../col/col": { type: "child", linked(t) { const { gutter: o } = this.data; o && t.setData({ gutter: o }); } } }, this.observers = { gutter() { this.setGutter(); } }, this.methods = { setGutter() { const { gutter: t } = this.data; this.$children.forEach(o => { o.setData({ gutter: t }); }); } }; }
};
Row = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Row);
exports.default = Row;
