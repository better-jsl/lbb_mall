"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const { prefix: prefix } = config_1.default, name = `${prefix}-cell-group`;
let CellGroup = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`, `${prefix}-class-title`], this.relations = { "../cell/cell": { type: "child", linked() { this.updateLastChid(); }, unlinked() { this.updateLastChid(); } } }, this.properties = props_1.default, this.data = { prefix: prefix, classPrefix: name }, this.methods = { updateLastChid() { const e = this.$children; e.forEach((t, o) => t.setData({ isLastChild: o === e.length - 1 })); } }; }
};
CellGroup = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], CellGroup);
exports.default = CellGroup;
