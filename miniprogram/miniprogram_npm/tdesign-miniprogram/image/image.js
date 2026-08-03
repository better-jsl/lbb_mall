"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const props_1 = require("./props");
const config_1 = require("../common/config");
const utils_1 = require("../common/utils");
const version_1 = require("../common/version");
const { prefix: prefix } = config_1.default, name = `${prefix}-image`;
let Image = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`, `${prefix}-class-load`, `${prefix}-class-image`, `${prefix}-class-error`], this.options = { multipleSlots: !0 }, this.properties = props_1.default, this.data = { prefix: prefix, isLoading: !0, isFailed: !1, innerStyle: "", classPrefix: name }, this.preSrc = void 0, this.observers = { src() { this.preSrc !== this.properties.src && this.update(); }, "width, height"(e, i) { this.calcSize(e, i); } }, this.methods = { onLoaded(e) { const i = utils_1.appBaseInfo.SDKVersion, { mode: t, tId: s } = this.properties, r = (0, version_1.compareVersion)(i, "2.10.3") < 0; if ("heightFix" === t && r) {
            const { height: i, width: t } = e.detail;
            (0, utils_1.getRect)(this, `#${s || "image"}`).then(e => { const { height: s } = e, r = (s / i * t).toFixed(2); this.setData({ innerStyle: `height: ${(0, utils_1.addUnit)(s)}; width: ${r}px;` }); });
        } this.setData({ isLoading: !1, isFailed: !1 }), this.triggerEvent("load", e.detail); }, onLoadError(e) { this.setData({ isLoading: !1, isFailed: !0 }), this.triggerEvent("error", e.detail); }, calcSize(e, i) { let t = ""; e && (t += `width: ${(0, utils_1.addUnit)(e)};`), i && (t += `height: ${(0, utils_1.addUnit)(i)};`), this.setData({ innerStyle: t }); }, update() { const { src: e } = this.properties; this.preSrc = e, e ? this.setData({ isLoading: !0, isFailed: !1 }) : this.onLoadError({ errMsg: "图片链接为空" }); } }; }
};
Image = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Image);
exports.default = Image;
