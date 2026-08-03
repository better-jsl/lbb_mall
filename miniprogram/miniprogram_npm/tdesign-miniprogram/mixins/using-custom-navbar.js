"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../common/utils");
const useCustomNavbarBehavior = Behavior({ properties: { usingCustomNavbar: { type: Boolean, value: !1 }, customNavbarHeight: { type: Number, value: 0 } }, data: { distanceTop: 0 }, lifetimes: { attached() { this.properties.usingCustomNavbar && this.calculateCustomNavbarDistanceTop(); } }, methods: { calculateCustomNavbarDistanceTop() { const { statusBarHeight: t } = utils_1.systemInfo, a = wx.getMenuButtonBoundingClientRect(), e = a.top + a.bottom - t; this.setData({ distanceTop: Math.max(e, this.properties.customNavbarHeight + t) }); } } });
exports.default = useCustomNavbarBehavior;
