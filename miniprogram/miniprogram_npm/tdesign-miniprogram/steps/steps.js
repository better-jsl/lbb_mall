"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const { prefix: prefix } = config_1.default, name = `${prefix}-steps`;
let Steps = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.relations = { "../step-item/step-item": { type: "child", linked(e) { this.updateChildren(); const { readonly: t } = this.data; e.setData({ readonly: t }); }, unlinked() { this.updateLastChid(); } } }, this.externalClasses = [`${prefix}-class`], this.properties = props_1.default, this.controlledProps = [{ key: "current", event: "change" }], this.data = { prefix: prefix, classPrefix: name }, this.observers = { "current, theme, sequence"() { this.updateChildren(); } }, this.methods = { updateChildren() { const e = this.$children; e.forEach((t, s) => { t.updateStatus(Object.assign({ index: s, items: e }, this.data)); }); }, updateLastChid() { const e = this.$children; e.forEach((t, s) => t.setData({ isLastChild: s === e.length - 1 })); }, handleClick(e) { if (!this.data.readonly) {
            const t = this.data.current;
            this._trigger("change", { previous: t, current: e });
        } } }; }
};
Steps = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Steps);
exports.default = Steps;
