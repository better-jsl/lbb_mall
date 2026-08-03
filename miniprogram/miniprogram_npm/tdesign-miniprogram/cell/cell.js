"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const utils_1 = require("../common/utils");
const { prefix: prefix } = config_1.default, name = `${prefix}-cell`;
let Cell = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`, `${prefix}-class-title`, `${prefix}-class-description`, `${prefix}-class-note`, `${prefix}-class-hover`, `${prefix}-class-image`, `${prefix}-class-left`, `${prefix}-class-left-icon`, `${prefix}-class-center`, `${prefix}-class-right`, `${prefix}-class-right-icon`], this.relations = { "../cell-group/cell-group": { type: "parent" } }, this.options = { multipleSlots: !0 }, this.properties = props_1.default, this.data = { prefix: prefix, classPrefix: name, isLastChild: !1 }, this.observers = { leftIcon(e) { this.setIcon("_leftIcon", e, ""); }, rightIcon(e) { this.setIcon("_rightIcon", e, ""); }, arrow(e) { this.setIcon("_arrow", e, "chevron-right"); } }; }
    setIcon(e, t, s) { this.setData({ [e]: (0, utils_1.calcIcon)(t, s) }); }
    onClick(e) { this.triggerEvent("click", e.detail), this.jumpLink(); }
    jumpLink(e = "url", t = "jumpType") { const s = this.data[e], i = this.data[t]; s && wx[i]({ url: s }); }
};
Cell = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Cell);
exports.default = Cell;
