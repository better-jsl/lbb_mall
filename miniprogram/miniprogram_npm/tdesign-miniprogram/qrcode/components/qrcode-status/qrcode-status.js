"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const props_1 = require("./props");
const config_1 = require("../../../common/config");
const index_1 = require("../../../common/src/index");
const { prefix: prefix } = config_1.default, name = `${prefix}-qrcode`;
let QRCode = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.options = { multipleSlots: !0 }, this.properties = Object.assign(Object.assign({}, props_1.default), { statusRender: { type: Boolean, value: !1 } }), this.data = { prefix: prefix, classPrefix: name, isSkyline: !1 }, this.lifetimes = { attached() { this.setData({ isSkyline: "skyline" === this.renderer }); } }, this.methods = { handleRefresh() { this.triggerEvent("refresh"); } }; }
};
QRCode = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], QRCode);
exports.default = QRCode;
