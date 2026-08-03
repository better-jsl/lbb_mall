"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const props_1 = require("./props");
const config_1 = require("../common/config");
const index_1 = require("../common/src/index");
const using_custom_navbar_1 = require("../mixins/using-custom-navbar");
const { prefix: prefix } = config_1.default, name = `${prefix}-form`;
let Form = class extends index_1.SuperComponent {
    constructor() { super(...arguments), this.behaviors = ["wx://component-export", using_custom_navbar_1.default], this.externalClasses = [`${prefix}-class`, `${prefix}-class-label`, `${prefix}-class-controls`, `${prefix}-class-help`, `${prefix}-class-extra`], this.properties = props_1.default, this.options = { multipleSlots: !0 }, this.relations = { "../form-item/form-item": { type: "child", linked() { } } }, this.data = { prefix: prefix, classPrefix: name, children: [], initialData: {}, fields: [] }, this.lifetimes = { ready() { this.initFormData(); } }, this.methods = { initFormData() { const { data: t } = this.properties, e = t || {}, r = Object.assign({}, e), i = Object.keys(e); this.setData({ initialData: r, fields: i }); }, registerChild(t) { const { children: e } = this.data; e.find(e => e.data.name === t.data.name) || (e.push(t), this.setData({ children: e })); }, unregisterChild(t) { const { children: e } = this.data, r = e.findIndex(e => e.data.name === t); r > -1 && (e.splice(r, 1), this.setData({ children: e })); }, validate() { return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () { const { children: t } = this.data, { data: e } = this.properties, r = t.map(t => t.validate(e, "all", this.properties.showErrorMessage)); try {
            const t = yield Promise.all(r), e = this.formatValidateResult(t);
            return !0 !== e && this.scrollToError(e), this.triggerEvent("validate", { validateResult: e }), e;
        }
        catch (t) {
            return !1;
        } }); }, scrollToError(t) { const { distanceTop: e } = this.data, { scrollToFirstError: r } = this.properties; if (!r)
            return; const i = Object.keys(t)[0]; if (!i)
            return; const { children: a } = this.data, s = a.find(t => t.properties.name === i); s && s.scrollIntoView(r, e); }, validateOnly(t) { return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () { const { fields: e, trigger: r = "all" } = t, { children: i } = this.data, a = i.filter(t => !(e && e.length > 0) || e.includes(t.data.name)).map(t => t.validateOnly(r)); try {
            const t = yield Promise.all(a);
            return this.formatValidateResult(t);
        }
        catch (t) {
            return !1;
        } }); }, formatValidateResult(t) { const e = {}; let r = !1; return t.forEach(t => { t && "object" == typeof t && Object.keys(t).forEach(i => { !0 !== t[i] && (e[i] = t[i], r = !0); }); }), !r || e; }, getFirstError(t) { if (!0 === t)
            return ""; const e = Object.keys(t)[0]; if (!e)
            return ""; const r = t[e]; return Array.isArray(r) && r.length > 0 && r[0].message || ""; }, submit() { return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () { try {
            const t = yield this.validate(), e = this.getFirstError(t);
            return this.triggerEvent("submit", { validateResult: t, firstError: e }), t;
        }
        catch (t) {
            return !1;
        } }); }, getValidate() { return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () { try {
            const t = yield this.validate();
            return { validateResult: t, firstError: this.getFirstError(t) };
        }
        catch (t) {
            return !1;
        } }); }, getEmptyValue(t) { const e = this.properties.data[t]; return Array.isArray(e) ? [] : "object" == typeof e && null !== e ? {} : "number" == typeof e ? 0 : ""; }, reset() { const { children: t, initialData: e, fields: r } = this.data, i = {}; t.forEach(t => { r && r.includes(t.data.name) && ("empty" === this.properties.resetType ? i[t.data.name] = this.getEmptyValue(t.data.name) : "initial" === this.properties.resetType && (i[t.data.name] = e[t.data.name]), t.resetField()); }), this.triggerEvent("reset", { formData: i }); }, clearValidate(t) { const { children: e } = this.data; e.forEach(e => { t && !t.includes(e.data.name) || e.clearValidate(); }); }, setValidateMessage(t) { const { children: e } = this.data; e.forEach(e => { t[e.data.name] && e.setValidateMessage(t[e.data.name]); }); }, onSubmit() { this.submit(); }, onReset() { this.reset(); } }; }
};
Form = (0, tslib_1.__decorate)([(0, index_1.wxComponent)()], Form);
exports.default = Form;
