"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const utils_1 = require("../common/utils");
const validator_1 = require("../common/validator");
const { prefix: prefix } = config_1.default, name = `${prefix}-skeleton`, ThemeMap = { avatar: [{ type: "circle", size: "96rpx" }], image: [{ type: "rect", size: "144rpx" }], text: [[{ width: "24%", height: "32rpx", marginRight: "32rpx" }, { width: "76%", height: "32rpx" }], 1], paragraph: [1, 1, 1, { width: "55%" }] };
let Skeleton = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`, `${prefix}-class-col`, `${prefix}-class-row`], this.properties = props_1.default, this.timer = void 0, this.data = { prefix: prefix, classPrefix: name, parsedRowCols: [] }, this.observers = { rowCol() { this.init(); }, "loading, delay"() { this.isShowSkeleton(); } }, this.lifetimes = { attached() { this.init(), this.isShowSkeleton(); }, detached() { this.clearTimer(); } }, this.methods = { init() { const { theme: e, rowCol: t } = this.properties, i = []; t.length ? i.push(...t) : i.push(...ThemeMap[e || "text"]); const s = i.map(e => { if ((0, validator_1.isInteger)(e) && e >= 0)
            return new Array(e).fill({ class: this.getColItemClass({ type: "text" }), style: {} }); if (Array.isArray(e))
            return e.map(e => Object.assign(Object.assign({}, e), { class: this.getColItemClass(e), style: this.getColItemStyle(e) })); const t = e; return [Object.assign(Object.assign({}, t), { class: this.getColItemClass(t), style: this.getColItemStyle(t) })]; }); this.setData({ parsedRowCols: s }); }, getColItemClass(e) { return (0, utils_1.classNames)([`${name}__col`, `${name}--type-${e.type || "text"}`, `${name}--animation-${this.properties.animation}`]); }, getColItemStyle(e) { const t = {}; return ["width", "height", "marginRight", "marginLeft", "margin", "size", "background", "backgroundColor", "borderRadius"].forEach(i => { if (i in e) {
            const s = (0, validator_1.isNumeric)(e[i]) ? `${e[i]}px` : e[i];
            "size" === i ? [t.width, t.height] = [s, s] : t[i] = s;
        } }), t; }, clearTimer() { this.timer && (clearTimeout(this.timer), this.timer = null); }, isShowSkeleton() { this.clearTimer(); const { loading: e, delay: t } = this.properties; e && 0 !== t ? this.timer = setTimeout(() => { this.setData({ isShow: this.properties.loading }); }, t) : this.setData({ isShow: e }); } }; }
};
Skeleton = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Skeleton);
exports.default = Skeleton;
