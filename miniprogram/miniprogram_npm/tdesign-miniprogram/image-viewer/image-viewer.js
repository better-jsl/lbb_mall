"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const utils_1 = require("../common/utils");
const config_1 = require("../common/config");
const props_1 = require("./props");
const { prefix: prefix } = config_1.default, name = `${prefix}-image-viewer`;
let ImageViewer = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`], this.properties = Object.assign({}, props_1.default), this.data = { prefix: prefix, classPrefix: name, currentSwiperIndex: 0, loadedImageIndexes: [], windowHeight: 0, windowWidth: 0, swiperStyle: {}, imagesStyle: {}, maskTop: 0 }, this.options = { multipleSlots: !0 }, this.controlledProps = [{ key: "visible", event: "close" }], this.observers = { "visible,initialIndex,images"(e, t, s) { e && (null == s ? void 0 : s.length) && this.setData({ loadedImageIndexes: [], currentSwiperIndex: t >= s.length ? s.length - 1 : t }); }, closeBtn(e) { this.setData({ _closeBtn: (0, utils_1.calcIcon)(e, "close") }); }, deleteBtn(e) { this.setData({ _deleteBtn: (0, utils_1.calcIcon)(e, "delete") }); } }, this.methods = { calcMaskTop() { if (this.data.usingCustomNavbar) {
            const e = (null === wx || void 0 === wx ? void 0 : wx.getMenuButtonBoundingClientRect()) || null, { statusBarHeight: t } = utils_1.systemInfo;
            e && t && this.setData({ maskTop: e.top - t + e.bottom });
        } }, saveScreenSize() { const { windowHeight: e, windowWidth: t } = utils_1.systemInfo; this.setData({ windowHeight: e, windowWidth: t }); }, calcImageDisplayStyle(e, t) { const { windowWidth: s, windowHeight: i } = this.data, a = e / t; if (e < s && t < i)
            return { styleObj: { width: 2 * e + "rpx", height: 2 * t + "rpx", left: "50%", transform: "translate(-50%, -50%)" } }; if (a >= 1)
            return { styleObj: { width: "100vw", height: s / a * 2 + "rpx" } }; const n = a * i * 2; return n < s ? { styleObj: { width: `${n}rpx`, height: "100vh", left: "50%", transform: "translate(-50%, -50%)" } } : { styleObj: { width: "100vw", height: s / e * t * 2 + "rpx" } }; }, onImageLoadSuccess(e) { const { detail: { width: t, height: s }, currentTarget: { dataset: { index: i } } } = e, { mode: a, styleObj: n } = this.calcImageDisplayStyle(t, s), o = this.data.imagesStyle, r = this.data.swiperStyle; this.data.loadedImageIndexes.includes(i) || this.setData({ loadedImageIndexes: [...this.data.loadedImageIndexes, i] }), this.setData({ swiperStyle: Object.assign(Object.assign({}, r), { [i]: { style: `height: ${n.height}` } }), imagesStyle: Object.assign(Object.assign({}, o), { [i]: { mode: a, style: (0, utils_1.styles)(Object.assign({}, n)) } }) }); }, onSwiperChange(e) { const { detail: { current: t } } = e; this.setData({ currentSwiperIndex: t }), this._trigger("change", { index: t }); }, onClose(e) { const { source: t } = e.currentTarget.dataset; this._trigger("close", { visible: !1, trigger: t || "button", index: this.data.currentSwiperIndex }); }, onDelete() { this._trigger("delete", { index: this.data.currentSwiperIndex }); } }; }
    ready() { this.saveScreenSize(), this.calcMaskTop(); }
};
ImageViewer = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], ImageViewer);
exports.default = ImageViewer;
