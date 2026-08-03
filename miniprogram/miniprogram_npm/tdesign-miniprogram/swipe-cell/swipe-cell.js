"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const utils_1 = require("../common/utils");
const wechat_1 = require("../common/wechat");
let ARRAY = [];
const { prefix: prefix } = config_1.default, name = `${prefix}-swipe-cell`, ContainerClass = `.${name}`;
let SwiperCell = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`], this.options = { multipleSlots: !0 }, this.properties = props_1.default, this.data = { prefix: prefix, wrapperStyle: "", closed: !0, classPrefix: name, skipMove: !1 }, this.observers = { "left, right"() { this.setSwipeWidth(); } }, this.lifetimes = { attached() { ARRAY.push(this); }, ready() { this.setSwipeWidth(); }, detached() { ARRAY = ARRAY.filter(e => e !== this); } }; }
    setSwipeWidth() { Promise.all([(0, utils_1.getRect)(this, `${ContainerClass}__left`), (0, utils_1.getRect)(this, `${ContainerClass}__right`)]).then(([e, t]) => { 0 !== e.width || 0 !== t.width || this._hasObserved || (this._hasObserved = !0, (0, wechat_1.getObserver)(this, `.${name}`).then(() => { this.setSwipeWidth(); })), this.setData({ leftWidth: e.width, rightWidth: t.width }); }); }
    skipMove() { this.data.skipMove || this.setData({ skipMove: !0 }); }
    catchMove() { this.data.skipMove && this.setData({ skipMove: !1 }); }
    open() { this.setData({ opened: !0 }); }
    close() { this.setData({ opened: !1 }); }
    closeOther() { ARRAY.filter(e => e !== this).forEach(e => e.close()); }
    onTap() { this.close(); }
    onActionTap(e) { const { currentTarget: { dataset: { action: t } } } = e; this.triggerEvent("click", t); }
};
SwiperCell = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], SwiperCell);
exports.default = SwiperCell;
