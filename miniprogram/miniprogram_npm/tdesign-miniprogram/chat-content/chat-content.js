"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const { prefix: prefix } = config_1.default, name = `${prefix}-chat-content`;
let ChatContent = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.options = { multipleSlots: !0 }, this.properties = props_1.default, this.data = { classPrefix: name, textInfo: "" }, this.observers = { content() { this.setTextInfo(); } }, this.methods = { getEscapeReplacement: t => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[t]), escape(t, e = !1) { const s = /[&<>"']/, o = new RegExp(s.source, "g"), n = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/, a = new RegExp(n.source, "g"); if (e) {
            if (s.test(t))
                return t.replace(o, this.data.getEscapeReplacement);
        }
        else if (n.test(t))
            return t.replace(a, this.data.getEscapeReplacement); return t; }, onMarkdownClick(t) { this.triggerEvent("click", t.detail); }, setTextInfo() { "text" === this.properties.content.type || "error" === this.properties.status ? this.setData({ textInfo: this.escape(this.properties.content.data || "") }) : this.setData({ textInfo: this.properties.content.data }); } }, this.lifetimes = { created() { this.data.getEscapeReplacement = this.getEscapeReplacement.bind(this), this.data.escape = this.escape.bind(this); }, attached() { this.setTextInfo(); }, detached() { } }; }
};
ChatContent = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], ChatContent);
exports.default = ChatContent;
