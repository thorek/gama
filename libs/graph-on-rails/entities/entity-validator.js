"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityValidator = void 0;
var lodash_1 = __importDefault(require("lodash"));
var entity_accessor_1 = require("./entity-accessor");
//
//
var EntityValidator = /** @class */ (function () {
    function EntityValidator(entity) {
        this.entity = entity;
        this.validator = entity.runtime.validator(entity);
    }
    Object.defineProperty(EntityValidator.prototype, "runtime", {
        get: function () { return this.entity.runtime; },
        enumerable: false,
        configurable: true
    });
    /**
     *
     */
    EntityValidator.prototype.validate = function (attributes) {
        return __awaiter(this, void 0, void 0, function () {
            var action, validatable, violations, _a, _b, _c, _d, _e, _f, _g, _h, _j;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        action = lodash_1.default.has(attributes, 'id') ? 'update' : 'create';
                        return [4 /*yield*/, this.completeAttributes(attributes)];
                    case 1:
                        validatable = _k.sent();
                        violations = [];
                        _b = (_a = violations.push).apply;
                        _c = [violations];
                        return [4 /*yield*/, this.validateRequiredAssocTos(validatable)];
                    case 2:
                        _b.apply(_a, _c.concat([_k.sent()]));
                        _e = (_d = violations.push).apply;
                        _f = [violations];
                        return [4 /*yield*/, this.validateUniqe(validatable)];
                    case 3:
                        _e.apply(_d, _f.concat([_k.sent()]));
                        _h = (_g = violations.push).apply;
                        _j = [violations];
                        return [4 /*yield*/, this.validator.validate(validatable, action)];
                    case 4:
                        _h.apply(_g, _j.concat([_k.sent()]));
                        return [2 /*return*/, violations];
                }
            });
        });
    };
    /**
     * Retrieves the attributes from the ResolverContext, if an item exist (to be updated) the
     * current values are loaded and used when no values where provided
     * TODO what happens, when the user wants to delete a string value?
     * @returns map with attributes
     */
    EntityValidator.prototype.completeAttributes = function (attributes) {
        return __awaiter(this, void 0, void 0, function () {
            var id, current;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = lodash_1.default.get(attributes, 'id');
                        if (!id)
                            return [2 /*return*/, attributes];
                        return [4 /*yield*/, this.entity.findById(id)];
                    case 1:
                        current = _a.sent();
                        return [2 /*return*/, lodash_1.default.defaultsDeep(lodash_1.default.cloneDeep(attributes), current.item)];
                }
            });
        });
    };
    /**
     *
     */
    EntityValidator.prototype.validateRequiredAssocTos = function (attributes) {
        return __awaiter(this, void 0, void 0, function () {
            var violations, _i, _a, assocTo, violation;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        violations = [];
                        _i = 0, _a = this.entity.assocTo;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        assocTo = _a[_i];
                        if (!assocTo.required)
                            return [3 /*break*/, 3];
                        return [4 /*yield*/, this.validateRequiredAssocTo(assocTo, attributes)];
                    case 2:
                        violation = _b.sent();
                        if (violation)
                            violations.push(violation);
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, violations];
                }
            });
        });
    };
    /**
     *
     */
    EntityValidator.prototype.validateRequiredAssocTo = function (assocTo, attributes) {
        return __awaiter(this, void 0, void 0, function () {
            var refEntity, foreignKey, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        refEntity = this.runtime.entities[assocTo.type];
                        foreignKey = lodash_1.default.get(attributes, refEntity.foreignKey);
                        if (!foreignKey)
                            return [2 /*return*/, { attribute: refEntity.foreignKey, message: 'must be provided' }];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, refEntity.findById(lodash_1.default.toString(foreignKey))];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        if (error_1 instanceof entity_accessor_1.NotFoundError)
                            return [2 /*return*/, { attribute: refEntity.foreignKey, message: 'must refer to existing item' }];
                        return [2 /*return*/, { attribute: refEntity.foreignKey, message: lodash_1.default.toString(error_1) }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     */
    EntityValidator.prototype.validateUniqe = function (attributes) {
        return __awaiter(this, void 0, void 0, function () {
            var violations, _i, _a, name_1, attribute, violation;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        violations = [];
                        _i = 0, _a = lodash_1.default.keys(this.entity.attributes);
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        name_1 = _a[_i];
                        attribute = this.entity.attributes[name_1];
                        if (!attribute.unique)
                            return [3 /*break*/, 3];
                        return [4 /*yield*/, this.validateUniqeAttribute(name_1, attribute, attributes)];
                    case 2:
                        violation = _b.sent();
                        if (violation)
                            violations.push(violation);
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, violations];
                }
            });
        });
    };
    /**
     *
     */
    EntityValidator.prototype.validateUniqeAttribute = function (name, attribute, attributes) {
        return __awaiter(this, void 0, void 0, function () {
            var value, attrValues, scopeMsg, scopeEntity, scope, scopeValue, result, violation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        value = lodash_1.default.get(attributes, name);
                        if (lodash_1.default.isUndefined(value))
                            return [2 /*return*/];
                        attrValues = lodash_1.default.set({}, name, value);
                        scopeMsg = '';
                        if (lodash_1.default.isString(attribute.unique)) {
                            scopeEntity = this.runtime.entities[attribute.unique];
                            scope = scopeEntity ? scopeEntity.foreignKey : attribute.unique;
                            scopeValue = lodash_1.default.get(attributes, scope);
                            lodash_1.default.set(attrValues, scope, scopeValue);
                            scopeMsg = " within scope '" + attribute.unique + "'";
                        }
                        return [4 /*yield*/, this.entity.findByAttribute(attrValues)];
                    case 1:
                        result = _a.sent();
                        violation = { attribute: name, message: "value '" + value + "' must be unique" + scopeMsg };
                        return [2 /*return*/, this.isUniqueResult(attributes, result) ? undefined : violation];
                }
            });
        });
    };
    /**
     *
     */
    EntityValidator.prototype.isUniqueResult = function (attributes, result) {
        if (lodash_1.default.size(result) === 0)
            return true;
        if (lodash_1.default.size(result) > 1)
            return false;
        var currentId = lodash_1.default.toString(lodash_1.default.get(attributes, 'id'));
        return currentId === lodash_1.default.toString(lodash_1.default.get(lodash_1.default.first(result), 'id'));
    };
    return EntityValidator;
}());
exports.EntityValidator = EntityValidator;
