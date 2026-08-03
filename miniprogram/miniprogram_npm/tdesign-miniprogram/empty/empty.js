"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const props_1 = require("./props");
const config_1 = require("../common/config");
const utils_1 = require("../common/utils");
const { prefix: prefix } = config_1.default, name = `${prefix}-empty`;
let default_1 = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.options = { multipleSlots: !0 }, this.externalClasses = [`${prefix}-class`, `${prefix}-class-description`, `${prefix}-class-image`], this.properties = props_1.default, this.data = { prefix: prefix, classPrefix: name }, this.observers = { icon(e) { const o = (0, utils_1.setIcon)("icon", e, ""); this.setData(Object.assign({}, o)); } }; }
};
default_1 = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], default_1);
exports.default = default_1;
