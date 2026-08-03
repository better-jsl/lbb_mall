"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const props_1 = require("./props");
const config_1 = require("../common/config");
const index_1 = require("../common/src/index");
const using_config_1 = require("../mixins/using-config");
const { prefix: prefix } = config_1.default, componentName = "qrcode";
let QRCode = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.behaviors = [(0, using_config_1.default)({ componentName: "qrcode" })], this.externalClasses = [`${prefix}-class`, `${prefix}-class-canvas`], this.options = { multipleSlots: !0 }, this.properties = Object.assign(Object.assign({}, props_1.default), { statusRender: { type: Boolean, value: !1 } }), this.data = { prefix: prefix, showMask: !1, classPrefix: `${prefix}-qrcode`, canvasReady: !1 }, this.lifetimes = { ready() { return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () { const e = this.selectComponent("#qrcodeCanvas"), s = yield e.getCanvasNode(); this.setData({ canvasNode: s }); }); }, attached() { this.setData({ showMask: "active" !== this.properties.status }); } }, this.observers = { status: function (e) { this.setData({ showMask: "active" !== e }); } }, this.methods = { init() { const e = this.selectComponent("#qrcodeCanvas"); e && e.initCanvas(); }, handleDrawCompleted() { this.setData({ canvasReady: !0 }); }, handleDrawError(e) { console.error("二维码绘制失败", e); }, handleRefresh() { this.triggerEvent("refresh"); }, handleDownload() { return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () { this.data.canvasNode ? wx.canvasToTempFilePath({ canvas: this.data.canvasNode, success: e => { wx.saveImageToPhotosAlbum({ filePath: e.tempFilePath }); }, fail: e => { console.error("canvasToTempFilePath failed", e); } }, this) : console.error("未找到 canvas 节点"); }); } }; }
};
QRCode = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], QRCode);
exports.default = QRCode;
