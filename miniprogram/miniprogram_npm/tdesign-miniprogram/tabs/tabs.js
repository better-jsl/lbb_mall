"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const props_1 = require("./props");
const config_1 = require("../common/config");
const touch_1 = require("../mixins/touch");
const utils_1 = require("../common/utils");
const wechat_1 = require("../common/wechat");
const { prefix: prefix } = config_1.default, name = `${prefix}-tabs`, getUniqueID = (0, utils_1.uniqueFactory)("tabs");
let Tabs = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.options = { pureDataPattern: /^currentLabels$/ }, this.behaviors = [touch_1.default], this.externalClasses = [`${prefix}-class`, `${prefix}-class-item`, `${prefix}-class-active`, `${prefix}-class-track`, `${prefix}-class-content`], this.relations = { "../tab-panel/tab-panel": { type: "descendant", linked(t) { this.children.push(t), this.initChildId(), t.index = this.children.length - 1, this.updateTabs(); }, unlinked(t) { this.children = this.children.filter(e => e.index !== t.index), this.updateTabs(() => this.setTrack()), this.initChildId(); } } }, this.properties = props_1.default, this.controlledProps = [{ key: "value", event: "change" }], this.observers = { value(t) { t !== this.getCurrentName() && this.setCurrentIndexByName(t); } }, this.data = { prefix: prefix, classPrefix: name, tabs: [], currentLabels: [], currentIndex: -1, trackOption: { lineWidth: 0, distance: 0, isInit: !0 }, offset: 0, scrollLeft: 0, tabID: "", placement: "top" }, this.lifetimes = { created() { this.children = this.children || []; }, attached() { wx.nextTick(() => { this.setTrack(); }), (0, utils_1.getRect)(this, `.${name}`).then(t => { this.containerWidth = t.width; }), this.setData({ tabID: getUniqueID() }); } }, this.methods = { onScroll(t) { const { scrollLeft: e } = t.detail; this.setData({ scrollLeft: e }); }, updateTabs(t) { const { children: e } = this, i = e.map(t => t.data); i.forEach(t => { "string" == typeof t.icon && (t.icon = { name: t.icon }); }), this.setData({ tabs: i }, t), this.setCurrentIndexByName(this.properties.value); }, setCurrentIndexByName(t) { const { children: e } = this, i = e.findIndex(e => e.getComputedName() === `${t}`); i > -1 && this.setCurrentIndex(i); }, setCurrentIndex(t) { if (t <= -1 || t >= this.children.length)
            return; const e = []; this.children.forEach((i, s) => { const r = t === s; r === i.data.active && i.initialized || i.render(r, this), this.data.animation && s <= t && !i.data.hasActivated && i.setData({ hasActivated: !0 }), e.push(i.data.label); }); const { currentIndex: i, currentLabels: s } = this.data; i === t && s.join("") === e.join("") || this.setData({ currentIndex: t, currentLabels: e }, () => { this.setTrack(); }); }, getCurrentName() { if (this.children) {
            const t = this.children[this.data.currentIndex];
            if (t)
                return t.getComputedName();
        } }, calcScrollOffset: (t, e, i, s) => s + e - .5 * t + i / 2, getTabHeight() { return (0, utils_1.getRect)(this, `.${name}`); }, getTrackSize() { const { bottomLineMode: t } = this.properties, e = { fixed: `.${prefix}-tabs__track`, auto: `.${prefix}-tabs__item--active .${prefix}-tabs__item-inner`, full: `.${prefix}-tabs__item--active` }; return new Promise((i, s) => { this.trackWidth ? i(this.trackWidth) : (0, utils_1.getRect)(this, e[t] || e.fixed).then(t => { t && i(t.width); }).catch(s); }); }, setTrack() { return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () { const { children: t } = this; if (!t)
            return; const { currentIndex: e } = this.data; if (!(e <= -1))
            try {
                const t = yield (0, utils_1.getRect)(this, `.${prefix}-tabs__item`, !0), i = t[e];
                if (!i)
                    return;
                let s = 0, r = 0, a = 0;
                if (t.forEach(t => { s < e && (r += t.width, s += 1), a += t.width; }), this.containerWidth) {
                    const t = this.calcScrollOffset(this.containerWidth, i.left, i.width, this.data.scrollLeft), e = a - this.containerWidth;
                    this.setData({ offset: Math.min(Math.max(t, 0), e) });
                }
                else
                    this._hasObserved || (this._hasObserved = !0, (0, wechat_1.getObserver)(this, `.${name}`).then(() => this.setTrack()));
                const n = yield this.getTrackSize();
                "line" === this.data.theme && (r += (i.width - n) / 2);
                const h = void 0 === this.previousIndex;
                (h || this.previousIndex !== e) && (this.previousIndex = e, this.setData({ trackOption: { lineWidth: n, distance: r, isInit: h } }));
            }
            catch (t) {
                this.triggerEvent("error", t);
            } }); }, onTabTap(t) { const { index: e } = t.currentTarget.dataset; this.changeIndex(e); }, onTouchStart(t) { this.properties.swipeable && this.touchStart(t); }, onTouchMove(t) { this.properties.swipeable && this.touchMove(t); }, onTouchEnd() { if (!this.properties.swipeable)
            return; const { direction: t, deltaX: e, offsetX: i } = this; if ("horizontal" === t && i >= 50) {
            const t = this.getAvailableTabIndex(e);
            -1 !== t && this.changeIndex(t);
        } }, onTouchScroll(t) { this._trigger("scroll", t.detail); }, changeIndex(t) { const e = this.data.tabs[t], { value: i, label: s } = e; (null == e ? void 0 : e.disabled) || t === this.data.currentIndex || this._trigger("change", { value: i, label: s }), this._trigger("click", { value: i, label: s }); }, getAvailableTabIndex(t) { const e = t > 0 ? -1 : 1, { currentIndex: i, tabs: s } = this.data, r = s.length; for (let t = e; i + e >= 0 && i + e < r; t += e) {
            const e = i + t;
            if (!(e >= 0 && e < r && s[e]))
                return i;
            if (!s[e].disabled)
                return e;
        } return -1; } }; }
    initChildId() { this.children.forEach((t, e) => { t.setId(`${this.data.tabID}_panel_${e}`); }); }
};
Tabs = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Tabs);
exports.default = Tabs;
