"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const utils_1 = require("../common/utils");
const validator_1 = require("../common/validator");
const { prefix: prefix } = config_1.default, name = `${prefix}-grid-item`, getUniqueID = (0, utils_1.uniqueFactory)("grid_item");
var LinkTypes;
!function (t) { t["redirect-to"] = "redirectTo", t["switch-tab"] = "switchTab", t.relaunch = "reLaunch", t["navigate-to"] = "navigateTo"; }(LinkTypes || (LinkTypes = {}));
let GridItem = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`, `${prefix}-class-content`, `${prefix}-class-image`, `${prefix}-class-text`, `${prefix}-class-description`], this.options = { multipleSlots: !0 }, this.relations = { "../grid/grid": { type: "ancestor", linked(t) { this.parent = t, this.updateStyle(), this.setData({ column: t.data.column }); } } }, this.properties = props_1.default, this.data = { prefix: prefix, classPrefix: name, gridItemStyle: "", gridItemWrapperStyle: "", gridItemContentStyle: "", align: "center", column: 0, describedbyID: "" }, this.observers = { icon(t) { const e = (0, utils_1.setIcon)("icon", t, ""); this.setData(Object.assign({}, e)); } }, this.lifetimes = { ready() { this.setData({ describedbyID: getUniqueID() }); } }; }
    updateStyle() { const { hover: t, align: e } = this.parent.properties, r = [], i = [], o = [], s = this.getWidthStyle(), n = this.getPaddingStyle(), p = this.getBorderStyle(); s && r.push(s), n && i.push(n), p && o.push(p), this.setData({ gridItemStyle: `${r.join(";")}`, gridItemWrapperStyle: i.join(";"), gridItemContentStyle: o.join(";"), hover: t, layout: this.properties.layout, align: e }); }
    getWidthStyle() { const { column: t } = this.parent.properties; return t > 0 ? `width:${1 / t * 100}%` : ""; }
    getPaddingStyle() { const { gutter: t } = this.parent.properties; return t ? `padding-bottom:${t}rpx;padding-right:${t}rpx` : ""; }
    getBorderStyle() { const { gutter: t } = this.parent.properties; let { border: e } = this.parent.properties; if (!e)
        return ""; (0, validator_1.isObject)(e) || (e = {}); const { color: r = "#266FE8", width: i = 2, style: o = "solid" } = e; return t ? `border:${i}rpx ${o} ${r}` : `border-bottom:${i}rpx ${o} ${r};border-right:${i}rpx ${o} ${r}`; }
    onClick(t) { const { item: e } = t.currentTarget.dataset; this.triggerEvent("click", e), this.jumpLink(); }
    jumpLink() { const { url: t, jumpType: e } = this.properties; t && e && LinkTypes[e] && wx[LinkTypes[e]]({ url: t }); }
};
GridItem = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], GridItem);
exports.default = GridItem;
