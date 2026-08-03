"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const { prefix: prefix } = config_1.default, name = `${prefix}-chat-loading`;
let ChatLoading = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.options = { multipleSlots: !0 }, this.properties = props_1.default, this.data = { classPrefix: name }; }
};
ChatLoading = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], ChatLoading);
exports.default = ChatLoading;
