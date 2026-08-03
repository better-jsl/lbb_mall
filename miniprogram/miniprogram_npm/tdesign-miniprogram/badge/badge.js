"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const props_1 = require("./props");
const utils_1 = require("../common/utils");
const { prefix: prefix } = config_1.default, name = `${prefix}-badge`, getUniqueID = (0, utils_1.uniqueFactory)("badge");
let Badge = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.options = { multipleSlots: !0 }, this.externalClasses = [`${prefix}-class`, `${prefix}-class-count`, `${prefix}-class-content`], this.properties = props_1.default, this.data = { prefix: prefix, classPrefix: name, value: "", labelID: "", descriptionID: "", useOuterClass: !1 }, this.lifetimes = { ready() { const e = getUniqueID(); this.setData({ labelID: `${e}_label`, descriptionID: `${e}_description` }), this.checkForActualContent(); } }, this.methods = { checkForActualContent() { if (!this.properties.content && ["ribbon", "ribbon-right", "ribbon-left", "triangle-right", "triangle-left"].includes(this.properties.shape))
            return (0, utils_1.getRect)(this, `.${name}__content`).then(e => { const t = e.width > 0 || e.height > 0; this.setData({ useOuterClass: !t }); }); this.setData({ useOuterClass: !1 }); } }; }
};
Badge = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Badge);
exports.default = Badge;
