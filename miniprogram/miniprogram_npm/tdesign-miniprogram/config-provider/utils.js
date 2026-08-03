"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../common/utils");
function themeVarsToCSS(t, e = "--td-") { const o = {}; return Object.keys(t).forEach(r => { let s; s = r.startsWith("--") ? r : r.includes("-") ? `${e}${r}` : `${e}${(0, utils_1.toKebabCase)(r)}`, o[s] = String(t[r]); }), o; }
exports.default = themeVarsToCSS;
