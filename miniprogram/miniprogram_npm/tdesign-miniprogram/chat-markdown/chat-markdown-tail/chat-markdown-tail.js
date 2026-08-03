"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../../common/src/index");
const config_1 = require("../../common/config");
const { prefix: prefix } = config_1.default, name = `${prefix}-chat-markdown`;
let ChatMarkdownTail = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.options = {}, this.properties = { content: { type: String, value: "▋" } }, this.data = { classPrefix: name }; }
};
ChatMarkdownTail = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], ChatMarkdownTail);
exports.default = ChatMarkdownTail;
