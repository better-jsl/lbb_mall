"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../common/src/index");
const transition_1 = require("../mixins/transition");
const config_1 = require("../common/config");
const { prefix: prefix } = config_1.default, name = `${prefix}-transition`;
let Transition = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.externalClasses = [`${prefix}-class`], this.behaviors = [(0, transition_1.default)()], this.data = { classPrefix: name }; }
};
Transition = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Transition);
exports.default = Transition;
