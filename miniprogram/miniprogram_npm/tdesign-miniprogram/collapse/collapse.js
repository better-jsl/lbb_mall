"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const { prefix: prefix } = config_1.default, name = `${prefix}-collapse`;
let Collapse = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`], this.relations = { "../collapse-panel/collapse-panel": { type: "descendant" } }, this.controlledProps = [{ key: "value", event: "change" }], this.properties = props_1.default, this.data = { prefix: prefix, classPrefix: name }, this.observers = { "value, expandMutex "() { this.updateExpanded(); } }, this.methods = { updateExpanded() { this.$children.forEach(e => { e.updateExpanded(this.properties.value); }); }, switch(e) { const { expandMutex: t, value: o } = this.properties; let p = []; p = o.indexOf(e) > -1 ? o.filter(t => t !== e) : t ? [e] : o.concat(e), this._trigger("change", { value: p }); } }; }
};
Collapse = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Collapse);
exports.default = Collapse;
