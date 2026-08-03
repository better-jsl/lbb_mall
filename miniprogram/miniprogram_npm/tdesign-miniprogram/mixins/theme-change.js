"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../common/utils");
const themeChangeBehavior = Behavior({ data: { theme: "light" }, attached() { this._initTheme(); }, methods: { _initTheme() { const e = this; e.setData({ theme: utils_1.appBaseInfo.theme }), wx.onThemeChange(t => { e.setData({ theme: t.theme }); }); } } });
exports.default = themeChangeBehavior;
