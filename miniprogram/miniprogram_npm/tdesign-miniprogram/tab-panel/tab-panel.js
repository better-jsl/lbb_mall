"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const props_1 = require("./props");
const config_1 = require("../common/config");
const { prefix: prefix } = config_1.default, name = `${prefix}-tab-panel`;
let TabPanel = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`], this.relations = { "../tabs/tabs": { type: "ancestor" } }, this.options = { multipleSlots: !0 }, this.properties = props_1.default, this.data = { prefix: prefix, classPrefix: name, active: !1, hide: !0, id: "", hasActivated: !1 }, this.observers = { "label, badgeProps, disabled, icon, panel, value, lazy"() { this.update(); } }; }
    setId(e) { this.setData({ id: e }); }
    getComputedName() { return null != this.properties.value ? `${this.properties.value}` : `${this.index}`; }
    update() { var e; null === (e = this.$parent) || void 0 === e || e.updateTabs(); }
    render(e, t) { this.initialized = this.initialized || e, e && !this.data.hasActivated && this.setData({ hasActivated: !0 }), this.setData({ active: e, hide: !t.data.animation && !e }); }
};
TabPanel = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], TabPanel);
exports.default = TabPanel;
