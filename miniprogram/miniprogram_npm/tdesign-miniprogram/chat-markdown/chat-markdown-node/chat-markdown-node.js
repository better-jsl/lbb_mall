"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../../common/src/index");
const config_1 = require("../../common/config");
const { prefix: prefix } = config_1.default, name = `${prefix}-chat-markdown`;
let ChatMarkdownNode = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.options = { multipleSlots: !0 }, this.properties = { nodes: { type: Array, value: () => [] } }, this.data = { classPrefix: name }, this.methods = { nodeClick(t) { var e; const { index: a } = t.currentTarget.dataset || {}, o = null === (e = this.data.nodes) || void 0 === e ? void 0 : e[a]; this.handleClick(t, "node-tap", o); }, getCareMarkdown() { if (this.data.careMarkdown)
            return this.data.careMarkdown; for (this.setData({ careMarkdown: this.selectOwnerComponent() }); this.data.careMarkdown.__data__.name !== name; this.setData({ careMarkdown: this.data.careMarkdown.selectOwnerComponent() }))
            ; return this.data.careMarkdown; }, handleClick(t, e, a) { this.data.getCareMarkdown().triggerEvent("click", { event: t, node: a }); } }, this.lifetimes = { created() { this.data.getCareMarkdown = this.getCareMarkdown.bind(this), this.data.handleClick = this.handleClick.bind(this); }, attached() { }, detached() { } }; }
};
ChatMarkdownNode = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], ChatMarkdownNode);
exports.default = ChatMarkdownNode;
