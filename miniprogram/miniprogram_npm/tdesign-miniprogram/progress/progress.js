"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const utils_1 = require("./utils");
const utils_2 = require("../common/utils");
const { prefix: prefix } = config_1.default, name = `${prefix}-progress`;
let Progress = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`, `${prefix}-class-bar`, `${prefix}-class-label`], this.options = { multipleSlots: !0 }, this.properties = props_1.default, this.data = { prefix: prefix, classPrefix: name, colorBar: "", heightBar: "", computedStatus: "", computedProgress: 0, isIOS: !1 }, this.observers = { percentage(o) { o = Math.max(0, Math.min(o, 100)), this.setData({ computedStatus: 100 === o ? "success" : "", computedProgress: o }); }, color(o) { this.setData({ colorBar: (0, utils_1.getBackgroundColor)(o), colorCircle: "object" == typeof o ? "" : o }); }, strokeWidth(o) { if (!o)
            return ""; this.setData({ heightBar: (0, utils_2.unitConvert)(o) }); }, trackColor(o) { this.setData({ bgColorBar: o }); } }; }
    attached() { const o = (0, utils_2.isIOS)(); this.setData({ isIOS: o }); }
};
Progress = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Progress);
exports.default = Progress;
