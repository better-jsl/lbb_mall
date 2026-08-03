"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const generateBase64Url_1 = require("./utils/generateBase64Url");
const randomMovingStyle_1 = require("./utils/randomMovingStyle");
const utils_1 = require("../common/utils");
const { prefix: prefix } = config_1.default, name = `${prefix}-watermark`;
let Watermark = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`], this.properties = props_1.default, this.data = { classPrefix: name, watermarkStyle: {} }, this.lifetimes = { attached() { this.renderWatermark(); } }, this.observers = { "watermarkContent, movable, rotate, x, y, width, height, alpha, lineSpace, moveInterval, zIndex, rotate, offset, removable, isRepeat, layout"() { this.renderWatermark(); } }, this.methods = { watermarkColor: () => "dark" === utils_1.appBaseInfo.theme ? "rgba(238, 238, 238, 0.1)" : "rgba(0, 0, 0, 0.1)", renderWatermark() { this.createSelectorQuery().select("#watermarkCanvas").fields({ node: !0, size: !0 }).exec(e => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () { var t; if (!(null === (t = e[0]) || void 0 === t ? void 0 : t.node))
            return void console.error("Canvas node not found"); const r = e[0].node, a = this.properties, o = a.movable ? 0 : a.x, n = a.movable ? 0 : a.y, i = a.offset || [], m = i[0] || o / 2, s = i[1] || n / 2, l = { width: a.width, height: a.height, rotate: a.movable ? 0 : a.rotate, lineSpace: a.lineSpace, alpha: a.alpha, gapX: o, gapY: n, watermarkContent: a.watermarkContent, offsetLeft: m, offsetTop: s, watermarkColor: this.watermarkColor(), layout: a.layout }; (0, generateBase64Url_1.default)(r, l, (e, t) => { let r = {}; if (a.movable) {
            const { left0: e, left25: t, left50: a, left75: o, top0: n, top25: i, top50: m, top75: s } = (0, randomMovingStyle_1.default)();
            r = { "--watermark-left-0": e, "--watermark-left-25": t, "--watermark-left-50": a, "--watermark-left-75": o, "--watermark-top-0": n, "--watermark-top-25": i, "--watermark-top-50": m, "--watermark-top-75": s };
        } this.setData({ watermarkStyle: Object.assign({ zIndex: a.zIndex, position: "absolute", left: 0, right: 0, top: 0, bottom: 0, width: "100%", height: "100%", backgroundSize: `${(null == t ? void 0 : t.width) || o.value + a.width}px`, pointerEvents: "none", backgroundRepeat: a.movable ? "no-repeat" : "repeat", backgroundImage: `url('${e}')`, animation: a.movable ? `watermark infinite ${4 * a.moveInterval / 60}s` : "none" }, r) }); }); })); } }; }
};
Watermark = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Watermark);
exports.default = Watermark;
