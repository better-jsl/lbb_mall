"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const config_1 = require("../common/config");
const version_1 = require("../common/version");
const { prefix: prefix } = config_1.default;
let ScrollView = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`], this.behaviors = (0, version_1.canUseProxyScrollView)() ? ["wx://proxy-scroll-view"] : [], this.properties = { scrollIntoView: { type: String } }; }
};
ScrollView = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], ScrollView);
exports.default = ScrollView;
