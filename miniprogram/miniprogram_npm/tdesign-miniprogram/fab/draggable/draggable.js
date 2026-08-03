"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../../common/src/index");
const config_1 = require("../../common/config");
const props_1 = require("./props");
const utils_1 = require("../../common/utils");
const { prefix: prefix } = config_1.default, name = `${prefix}-draggable`;
let Draggable = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.properties = props_1.default, this.externalClasses = [`${prefix}-class`], this.data = { prefix: prefix, classPrefix: name }, this.lifetimes = { ready() { this.computedRect(); } }, this.methods = { onTouchStart(t) { "none" !== this.properties.direction && (this.startX = t.touches[0].clientX + utils_1.systemInfo.windowWidth - this.rect.right, this.startY = t.touches[0].clientY + utils_1.systemInfo.windowHeight - this.rect.bottom, this.triggerEvent("start", { startX: this.startX, startY: this.startY, rect: this.rect, e: t })); }, onTouchMove(t) { if ("none" === this.properties.direction)
            return; let e = this.startX - t.touches[0].clientX, i = this.startY - t.touches[0].clientY; "vertical" === this.properties.direction && (e = utils_1.systemInfo.windowWidth - this.rect.right), "horizontal" === this.properties.direction && (i = utils_1.systemInfo.windowHeight - this.rect.bottom), this.triggerEvent("move", { x: e, y: i, rect: this.rect, e: t }); }, onTouchEnd(t) { return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () { "none" !== this.properties.direction && (yield this.computedRect(), this.triggerEvent("end", { rect: this.rect, e: t })); }); }, computedRect() { return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () { this.rect = { right: 0, bottom: 0, width: 0, height: 0 }; try {
            this.rect = yield (0, utils_1.getRect)(this, `.${this.data.classPrefix}`);
        }
        catch (t) { } }); } }; }
};
Draggable = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Draggable);
exports.default = Draggable;
