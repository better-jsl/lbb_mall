"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const props_1 = require("./props");
const useQRCode_1 = require("../../hooks/useQRCode");
const index_1 = require("../../../common/src/index");
const utils_1 = require("../../../common/shared/qrcode/utils");
let QRCode = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.properties = props_1.default, this.lifetimes = { ready() { this.checkDefaultValue(), this.initCanvas(); } }, this.observers = { "**": function () { this.checkDefaultValue(), this.initCanvas(); } }, this.methods = { initCanvas() { return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () { this.createSelectorQuery().select("#qrcodeCanvas").fields({ node: !0, size: !0 }).exec(e => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () { var t; if (!(null === (t = e[0]) || void 0 === t ? void 0 : t.node))
            return; const i = e[0].node, o = i.getContext("2d"); yield this.drawQrcode(i, o); })); }); }, drawQrcode(e, t) { var i; return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () { if (!t)
            return; const { value: o, icon: r, size: a, iconSize: l, level: s, bgColor: n, color: c, includeMargin: d, marginSize: h } = this.properties, u = this.getSizeProp(l); try {
            const l = (0, useQRCode_1.default)({ value: o, level: s, minVersion: utils_1.DEFAULT_MINVERSION, includeMargin: d, marginSize: h, size: a, imageSettings: r ? { src: r, width: u.width, height: u.height, excavate: !0 } : void 0 }), g = wx.getWindowInfo().pixelRatio || 1;
            e.width = a * g, e.height = a * g;
            const m = a * g / l.numCells;
            t.scale(m, m), t.fillStyle = n, t.fillRect(0, 0, l.numCells, l.numCells);
            let v = l.cells;
            if (r && (null === (i = l.calculatedImageSettings) || void 0 === i ? void 0 : i.excavation) && (v = (0, utils_1.excavateModules)(l.cells, l.calculatedImageSettings.excavation)), t.fillStyle = c, v.forEach((e, i) => { e.forEach((e, o) => { e && t.fillRect(o + l.margin, i + l.margin, 1.05, 1.05); }); }), r && l.calculatedImageSettings) {
                const i = e.createImage();
                yield new Promise((e, t) => { i.onload = e, i.onerror = t, i.src = this.properties.icon; }), t.drawImage(i, l.calculatedImageSettings.x + l.margin, l.calculatedImageSettings.y + l.margin, l.calculatedImageSettings.w, l.calculatedImageSettings.h);
            }
            this.triggerEvent("drawCompleted");
        }
        catch (e) {
            this.triggerEvent("drawError", { error: e });
        } }); }, getSizeProp: e => e ? "number" == typeof e ? { width: e, height: e } : { width: e.width, height: e.height } : { width: 0, height: 0 }, checkDefaultValue() { const e = { bgColor: "", color: "" }; let t = !1; const { bgColor: i, color: o } = this.properties, { bgColor: r, color: a } = props_1.default; "" === i && r.value && (e.bgColor = r.value, t = !0), "" === o && a.value && (e.color = a.value, t = !0), t && this.setData(e); }, getCanvasNode() { return new Promise(e => { this.createSelectorQuery().select("#qrcodeCanvas").fields({ node: !0, size: !0 }).exec(t => { var i; e(null === (i = t[0]) || void 0 === i ? void 0 : i.node); }); }); } }; }
};
QRCode = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], QRCode);
exports.default = QRCode;
