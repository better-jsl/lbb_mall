"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const utils_1 = require("../common/utils");
const { prefix: prefix } = config_1.default, name = `${prefix}-icon`;
let Icon = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`], this.properties = props_1.default, this.data = { componentPrefix: prefix, classPrefix: name, isImage: !1, iconStyle: void 0 }, this.observers = { "name, color, size, style"() { this.setIconStyle(); } }, this.methods = { onTap(t) { this.triggerEvent("click", t.detail); }, setIconStyle() { const { name: t, color: e, size: o, classPrefix: i } = this.data, s = -1 !== t.indexOf("/"), n = null !== o && "" !== o ? (0, utils_1.addUnit)(o) : void 0, r = e ? { color: e } : {}, c = o ? { "font-size": n } : {}, a = Object.assign(Object.assign({}, r), c); this.setData({ isImage: s }, () => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () { if (s) {
            let t = n;
            t || (yield (0, utils_1.getRect)(this, `.${i}`).then(e => { t = (0, utils_1.addUnit)(null == e ? void 0 : e.height); }).catch(() => { })), a.width = t, a.height = t;
        } this.setData({ iconStyle: `${(0, utils_1.styles)(a)}` }); })); } }; }
};
Icon = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Icon);
exports.default = Icon;
