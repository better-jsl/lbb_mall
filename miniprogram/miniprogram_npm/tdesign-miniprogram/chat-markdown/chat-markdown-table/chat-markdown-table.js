"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../../common/src/index");
const config_1 = require("../../common/config");
const { prefix: prefix } = config_1.default, name = `${prefix}-chat-markdown-table`, markdownName = `${prefix}-chat-markdown`;
let ChatMarkdownTable = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.options = { multipleSlots: !0 }, this.properties = { node: { type: Object, value: {} } }, this.data = { classPrefix: name }, this.methods = { nodeClick(e) { this.getCareMarkdown().triggerEvent("click", { event: e, node: this.data.node }); }, getCareMarkdown() { if (this.data.careMarkdown)
            return this.data.careMarkdown; for (this.setData({ careMarkdown: this.selectOwnerComponent() }); this.data.careMarkdown.__data__.name !== markdownName; this.setData({ careMarkdown: this.data.careMarkdown.selectOwnerComponent() }))
            ; return this.data.careMarkdown; } }; }
};
ChatMarkdownTable = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], ChatMarkdownTable);
exports.default = ChatMarkdownTable;
