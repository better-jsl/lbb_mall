"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const message_interface_1 = require("./message.interface");
const utils_1 = require("../common/utils");
const showMessage = function (e, s = message_interface_1.MessageType.info) { const { context: t, selector: o = "#t-message" } = e, n = (0, tslib_1.__rest)(e, ["context", "selector"]), r = (0, utils_1.getInstance)(t, o); if ("boolean" != typeof n.single && (n.single = !0), r)
    return r.setMessage(n, s), r; console.error("未找到组件,请确认 selector && context 是否正确"); };
exports.default = { info: e => showMessage(e, message_interface_1.MessageType.info), success: e => showMessage(e, message_interface_1.MessageType.success), warning: e => showMessage(e, message_interface_1.MessageType.warning), error: e => showMessage(e, message_interface_1.MessageType.error), hide(e) { const { context: s, selector: t = "#t-message" } = Object.assign({}, e), o = (0, utils_1.getInstance)(s, t); o && o.hide(); } };
