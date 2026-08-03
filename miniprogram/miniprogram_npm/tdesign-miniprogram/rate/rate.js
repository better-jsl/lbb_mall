"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const utils_1 = require("../common/utils");
const using_config_1 = require("../mixins/using-config");
const { prefix: prefix } = config_1.default, componentName = "rate";
let Rate = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.behaviors = [(0, using_config_1.default)({ componentName: "rate" })], this.externalClasses = [`${prefix}-class`, `${prefix}-class-icon`, `${prefix}-class-text`], this.properties = props_1.default, this.controlledProps = [{ key: "value", event: "change" }], this.data = { prefix: prefix, classPrefix: `${prefix}-rate`, tipsVisible: !1, tipsLeft: 0, actionType: "", scaleIndex: -1, isVisibleToScreenReader: !1 }, this.methods = { onTouch(e, t) { const { classPrefix: i } = this.data, { count: s, allowHalf: o, gap: n, value: a, size: r } = this.properties, [c] = e.changedTouches, p = (0, utils_1.unitConvert)(n); (0, utils_1.getRect)(this, `.${i}__wrapper`).then(e => { const { width: i, left: h } = e, l = (i - (s - 1) * p) / s, m = (c.pageX - h + p) / (l + p), u = m % 1, d = m - u; let f = u <= .5 && o ? d + .5 : d + 1; f > s ? f = s : f < 0 && (f = 0); const x = Math.ceil(f - 1) * ((0, utils_1.unitConvert)(n) + (0, utils_1.unitConvert)(r)) + .5 * (0, utils_1.unitConvert)(r); this.setData({ tipsVisible: !0, actionType: t, scaleIndex: Math.ceil(f), tipsLeft: Math.max(x, 0) }), f !== a && this._trigger("change", { value: f }), this.touchEnd && this.hideTips(); }); }, onTap(e) { const { disabled: t } = this.properties; t || this.onTouch(e, "tap"); }, onTouchStart() { this.touchEnd = !1; }, onTouchMove(e) { this.onTouch(e, "move"), this.showAlertText(); }, onTouchEnd() { this.touchEnd = !0, this.hideTips(); }, hideTips() { "move" === this.data.actionType && this.setData({ tipsVisible: !1, scaleIndex: -1 }); }, onSelect(e) { const { value: t } = e.currentTarget.dataset, { actionType: i } = this.data; "move" !== i && (this._trigger("change", { value: t }), setTimeout(() => this.setData({ tipsVisible: !1, scaleIndex: -1 }), 300)); }, showAlertText() { !0 !== this.data.isVisibleToScreenReader && (this.setData({ isVisibleToScreenReader: !0 }), setTimeout(() => { this.setData({ isVisibleToScreenReader: !1 }); }, 2e3)); } }; }
};
Rate = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Rate);
exports.default = Rate;
