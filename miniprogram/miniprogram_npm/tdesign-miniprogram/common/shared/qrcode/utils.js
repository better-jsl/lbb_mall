"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSupportPath2d = exports.getMarginSize = exports.getImageSettings = exports.excavateModules = exports.generatePath = exports.DEFAULT_IMG_SCALE = exports.DEFAULT_MARGIN_SIZE = exports.SPEC_MARGIN_SIZE = exports.DEFAULT_MINVERSION = exports.DEFAULT_NEED_MARGIN = exports.DEFAULT_FRONT_COLOR = exports.DEFAULT_BACKGROUND_COLOR = exports.DEFAULT_LEVEL = exports.DEFAULT_SIZE = exports.ERROR_LEVEL_MAP = void 0;
const qrcodegen_1 = require("./qrcodegen");
exports.ERROR_LEVEL_MAP = { L: qrcodegen_1.Ecc.LOW, M: qrcodegen_1.Ecc.MEDIUM, Q: qrcodegen_1.Ecc.QUARTILE, H: qrcodegen_1.Ecc.HIGH };
exports.DEFAULT_SIZE = 160;
exports.DEFAULT_LEVEL = "M";
exports.DEFAULT_BACKGROUND_COLOR = "#FFFFFF";
exports.DEFAULT_FRONT_COLOR = "#000000";
exports.DEFAULT_NEED_MARGIN = !1;
exports.DEFAULT_MINVERSION = 1;
exports.SPEC_MARGIN_SIZE = 4;
exports.DEFAULT_MARGIN_SIZE = 0;
exports.DEFAULT_IMG_SCALE = .1;
const generatePath = (t, o = 0) => { const e = []; return t.forEach((t, n) => { let r = null; t.forEach((c, l) => { if (!c && null !== r)
    return e.push(`M${r + o} ${n + o}h${l - r}v1H${r + o}z`), void (r = null); if (l !== t.length - 1)
    c && null === r && (r = l);
else {
    if (!c)
        return;
    null === r ? e.push(`M${l + o},${n + o} h1v1H${l + o}z`) : e.push(`M${r + o},${n + o} h${l + 1 - r}v1H${r + o}z`);
} }); }), e.join(""); };
exports.generatePath = generatePath;
const excavateModules = (t, o) => t.slice().map((t, e) => e < o.y || e >= o.y + o.h ? t : t.map((t, e) => (e < o.x || e >= o.x + o.w) && t));
exports.excavateModules = excavateModules;
const getImageSettings = (t, o, e, n) => { if (null == n)
    return null; const r = t.length + 2 * e, c = Math.floor(.1 * o), l = r / o, a = (n.width || c) * l, h = (n.height || c) * l, s = null == n.x ? t.length / 2 - a / 2 : n.x * l, E = null == n.y ? t.length / 2 - h / 2 : n.y * l, p = null == n.opacity ? 1 : n.opacity; let i = null; if (n.excavate) {
    const t = Math.floor(s), o = Math.floor(E);
    i = { x: t, y: o, w: Math.ceil(a + s - t), h: Math.ceil(h + E - o) };
} const { crossOrigin: x } = n; return { x: s, y: E, h: h, w: a, excavation: i, opacity: p, crossOrigin: x }; };
exports.getImageSettings = getImageSettings;
const getMarginSize = (t, o) => null != o ? Math.max(Math.floor(o), 0) : t ? 4 : 0;
exports.getMarginSize = getMarginSize;
exports.isSupportPath2d = (() => { try {
    (new Path2D).addPath(new Path2D);
}
catch (t) {
    return !1;
} return !0; })();
