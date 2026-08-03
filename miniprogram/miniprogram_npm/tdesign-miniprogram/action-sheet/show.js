"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.close = exports.show = exports.ActionSheetTheme = void 0;
const tslib_1 = require("tslib");
const utils_1 = require("../common/utils");
!function (t) { t.List = "list", t.Grid = "grid"; }(exports.ActionSheetTheme || (exports.ActionSheetTheme = {}));
const show = function (t) { const e = Object.assign({}, t), { context: o, selector: n = "#t-action-sheet" } = e, c = (0, tslib_1.__rest)(e, ["context", "selector"]), s = (0, utils_1.getInstance)(o, n); if (s)
    return s.show(Object.assign({}, c)), s; console.error("未找到组件,请确认 selector && context 是否正确"); };
exports.show = show;
const close = function (t) { const { context: e, selector: o = "#t-action-sheet" } = Object.assign({}, t), n = (0, utils_1.getInstance)(e, o); n && n.close(); };
exports.close = close;
