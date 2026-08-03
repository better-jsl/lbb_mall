"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const qrcodegen_1 = require("../../common/shared/qrcode/qrcodegen");
const utils_1 = require("../../common/shared/qrcode/utils");
const useQRCode = e => { const { value: t, level: n, minVersion: r, includeMargin: g, marginSize: o, imageSettings: m, size: i } = e, s = (() => { const e = qrcodegen_1.QrSegment.makeSegments(t); return qrcodegen_1.QrCode.encodeSegments(e, utils_1.ERROR_LEVEL_MAP[n], r); })(), a = s.getModules(), d = (0, utils_1.getMarginSize)(g, o), c = (0, utils_1.getImageSettings)(a, i, d, m); return { cells: a, margin: d, numCells: a.length + 2 * d, calculatedImageSettings: c, qrcode: s }; };
exports.default = useQRCode;
