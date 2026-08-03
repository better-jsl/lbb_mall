"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const utils_1 = require("./utils");
const { prefix: prefix } = config_1.default, name = `${prefix}-count-down`;
let CountDown = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`, `${prefix}-class-count`, `${prefix}-class-split`], this.properties = props_1.default, this.observers = { time() { this.reset(); } }, this.data = { prefix: prefix, classPrefix: name, timeDataUnit: utils_1.TimeDataUnit, timeData: (0, utils_1.parseTimeData)(0), formattedTime: "0" }, this.timeoutId = null, this.isInitialTime = !1, this.lifetimes = { detached() { this.timeoutId && (clearTimeout(this.timeoutId), this.timeoutId = null); } }, this.methods = { start() { this.counting || (this.counting = !0, this.endTime = Date.now() + this.remain, this.doCount()); }, pause() { this.counting = !1, this.timeoutId && clearTimeout(this.timeoutId); }, reset() { this.pause(), this.remain = this.properties.time, this.updateTime(this.remain), this.properties.autoStart && this.remain > 0 && this.start(), this.isInitialTime = !0; }, getTime() { return Math.max(this.endTime - Date.now(), 0); }, updateTime(t) { const { format: i } = this.properties; this.remain = t; const e = (0, utils_1.parseTimeData)(t); this.triggerEvent("change", e); const { timeText: s } = (0, utils_1.parseFormat)(t, i), o = i.split(":"); this.setData({ timeRange: o, timeData: e, formattedTime: s.replace(/:/g, " : ") }), 0 === t && (this.counting || this.isInitialTime) && (this.pause(), this.triggerEvent("finish"), this.counting = !1); }, doCount() { this.timeoutId = setTimeout(() => { const t = this.getTime(); this.properties.millisecond ? this.updateTime(t) : (0, utils_1.isSameSecond)(t, this.remain) && 0 !== t || this.updateTime(t), 0 !== t && this.doCount(); }, 33); } }; }
};
CountDown = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], CountDown);
exports.default = CountDown;
