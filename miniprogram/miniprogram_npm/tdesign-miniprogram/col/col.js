"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const { prefix: prefix } = config_1.default, name = `${prefix}-col`;
let Col = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`], this.properties = props_1.default, this.data = { prefix: prefix, classPrefix: name }, this.relations = { "../row/row": { type: "parent" } }; }
};
Col = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Col);
exports.default = Col;
