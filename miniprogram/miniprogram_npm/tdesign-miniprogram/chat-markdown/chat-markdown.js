"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const marked_1 = require("marked");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const { prefix: prefix } = config_1.default, name = `${prefix}-chat-markdown`, DEFAULT_TAIL_CONTENT = "▋";
function resolveTailContent(t) { return t ? "boolean" == typeof t ? "▋" : t.content || "▋" : null; }
function flatListItems(t) { return t.reduce((t, e) => { var o; return (null === (o = e.tokens) || void 0 === o ? void 0 : o.length) && t.push(...e.tokens), t; }, []); }
function injectTailToTokens(t, e, o = 0) { var n, r, i, s, a; for (let l = t.length - 1; l >= 0; l -= 1) {
    const d = t[l];
    if ("code" === d.type && (null === (n = d.text || d.raw) || void 0 === n ? void 0 : n.trim()))
        return d.isTail = !0, d.tailContent = e, !0;
    if ("text" === d.type && (null === (r = d.text || d.raw) || void 0 === r ? void 0 : r.trim()))
        return d.isTail = !0, d.tailContent = e, !0;
    if ("table" === d.type) {
        const t = [...d.header ? [d.header] : [], ...d.rows || []];
        for (let n = t.length - 1; n >= 0; n -= 1) {
            const r = t[n];
            for (let t = r.length - 1; t >= 0; t -= 1) {
                const n = r[t];
                if ((null === (i = n.tokens) || void 0 === i ? void 0 : i.length) && injectTailToTokens(n.tokens, e, o + 1))
                    return !0;
            }
        }
    }
    else {
        let t = null;
        if ((null === (s = d.tokens) || void 0 === s ? void 0 : s.length) ? t = d.tokens : (null === (a = d.items) || void 0 === a ? void 0 : a.length) && (t = flatListItems(d.items)), (null == t ? void 0 : t.length) && injectTailToTokens(t, e, o + 1))
            return !0;
    }
} return !1; }
let ChatMarkdown = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.options = { multipleSlots: !0 }, this.properties = props_1.default, this.data = { classPrefix: name, nodes: [], name: name }, this.observers = { content: function (t) { this.parseMarkdown(t); }, streaming: function () { this.parseMarkdown(this.data.content); } }, this.methods = { parseMarkdown(t) { try {
            const e = new marked_1.Lexer(this.data.options).lex(t), { streaming: o } = this.data, n = resolveTailContent(null == o ? void 0 : o.tail);
            (null == o ? void 0 : o.hasNextChunk) && n && injectTailToTokens(e, n), this.setData({ nodes: e });
        }
        catch (e) {
            console.error("Markdown parsing error:", e), this.setData({ nodes: [{ type: "text", raw: t, text: t }] });
        } } }, this.lifetimes = { attached() { } }; }
};
ChatMarkdown = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], ChatMarkdown);
exports.default = ChatMarkdown;
