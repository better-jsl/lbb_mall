"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const utils_1 = require("../common/utils");
const { prefix: prefix } = config_1.default, name = `${prefix}-segmented`;
let Segmented = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.options = { multipleSlots: !0 }, this.externalClasses = [`${prefix}-class`, `${prefix}-class-thumb`, `${prefix}-class-item`], this.properties = props_1.default, this.controlledProps = [{ key: "value", event: "change" }], this.data = { prefix: prefix, classPrefix: name, segmentItems: [], activeIndex: -1, thumbStyle: "" }, this.lifetimes = { ready() { this.updateThumb(); } }, this.observers = { options(e) { this.updateOptions(e); }, "value, segmentItems"() { this.updateActiveIndex(); } }, this.methods = { updateOptions(e) { if (!(null == e ? void 0 : e.length))
            return; const t = e.map(e => { var t; return "string" == typeof e || "number" == typeof e ? { value: e, label: String(e) } : Object.assign(Object.assign({}, e), { label: null !== (t = e.label) && void 0 !== t ? t : String(e.value), icon: e.icon ? (0, utils_1.calcIcon)(e.icon) : null }); }); this.setData({ segmentItems: t }); }, updateActiveIndex() { const { value: e, segmentItems: t } = this.data; let s = -1; null != e && (s = t.findIndex(t => t.value === e)), s !== this.data.activeIndex && this.setData({ activeIndex: s }, () => { this.updateThumb(); }); }, updateThumb() { const { activeIndex: e, classPrefix: t } = this.data; if (e < 0)
            return; const s = `.${t}__group`, i = `.${t}-item-${e}`; Promise.all([(0, utils_1.getRect)(this, i), (0, utils_1.getRect)(this, s)]).then(([e, t]) => { if (e && t) {
            const s = e.left - t.left;
            this.setData({ thumbStyle: `width: ${e.width}px; transform: translateX(${s}px);` });
        } }); }, handleSelect(e) { const { index: t } = e.currentTarget.dataset, { segmentItems: s, activeIndex: i } = this.data, { disabled: n, options: a } = this.properties, o = s[t]; n || !o || o.disabled || t !== i && this._trigger("change", { value: o.value, selectedOption: a[t] }); } }; }
};
Segmented = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Segmented);
exports.default = Segmented;
