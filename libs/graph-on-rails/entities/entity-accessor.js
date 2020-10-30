"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.EntityAccessor = exports.NotFoundError = void 0;
var lodash_1 = __importDefault(require("lodash"));
var entity_deleter_1 = require("./entity-deleter");
var entity_item_1 = require("./entity-item");
var entity_module_1 = require("./entity-module");
//
//
var NotFoundError = /** @class */ (function (_super) {
    __extends(NotFoundError, _super);
    function NotFoundError(message) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, _newTarget.prototype); // restore prototype chain
        _this.name = NotFoundError.name; // stack traces display correctly now
        return _this;
    }
    return NotFoundError;
}(Error));
exports.NotFoundError = NotFoundError;
//
//
var EntityAccessor = /** @class */ (function (_super) {
    __extends(EntityAccessor, _super);
    function EntityAccessor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.deleter = new entity_deleter_1.EntityDeleter(_this.entity);
        return _this;
    }
    Object.defineProperty(EntityAccessor.prototype, "dataStore", {
        get: function () { return this.entity.runtime.dataStore; },
        enumerable: false,
        configurable: true
    });
    /**
     *
     */
    EntityAccessor.prototype.findById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!id)
                            throw new Error("[" + this.entity.name + "].findById - no id provided");
                        return [4 /*yield*/, this.dataStore.findById(this.entity, id)];
                    case 1:
                        item = _a.sent();
                        if (!item)
                            throw new NotFoundError("[" + this.entity.name + "] with id '" + id + "' does not exist");
                        return [2 /*return*/, entity_item_1.EntityItem.create(this.entity, item)];
                }
            });
        });
    };
    /**
     *
     */
    EntityAccessor.prototype.findByIds = function (ids) {
        return __awaiter(this, void 0, void 0, function () {
            var items;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dataStore.findByIds(this.entity, ids)];
                    case 1:
                        items = _a.sent();
                        return [2 /*return*/, Promise.all(lodash_1.default.map(items, function (item) { return entity_item_1.EntityItem.create(_this.entity, item); }))];
                }
            });
        });
    };
    /**
     *
     */
    EntityAccessor.prototype.findByAttribute = function (attrValue) {
        return __awaiter(this, void 0, void 0, function () {
            var items;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dataStore.findByAttribute(this.entity, attrValue)];
                    case 1:
                        items = _a.sent();
                        return [2 /*return*/, Promise.all(lodash_1.default.map(items, function (item) { return entity_item_1.EntityItem.create(_this.entity, item); }))];
                }
            });
        });
    };
    /**
     *
     * @param filter as it comes from the graphql request
     */
    EntityAccessor.prototype.findByFilter = function (filter, sort, paging) {
        return __awaiter(this, void 0, void 0, function () {
            var items, _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.entity.isPolymorph) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.dataStore.aggregateFind(this.entity.getThisOrAllNestedEntities(), filter, sort, paging)];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.dataStore.findByFilter(this.entity, filter, sort, paging)];
                    case 3:
                        _a = _b.sent();
                        _b.label = 4;
                    case 4:
                        items = _a;
                        return [2 /*return*/, Promise.all(lodash_1.default.map(items, function (item) { return entity_item_1.EntityItem.create(_this.entity, item); }))];
                }
            });
        });
    };
    /**
     *
     */
    EntityAccessor.prototype.save = function (attributes, skipValidation) {
        if (skipValidation === void 0) { skipValidation = false; }
        return __awaiter(this, void 0, void 0, function () {
            var validationViolations, item, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.setDefaultValues(attributes);
                        if (!!skipValidation) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.entity.validate(attributes)];
                    case 1:
                        validationViolations = _b.sent();
                        if (lodash_1.default.size(validationViolations))
                            return [2 /*return*/, validationViolations];
                        _b.label = 2;
                    case 2:
                        if (!lodash_1.default.has(attributes, 'id')) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.dataStore.update(this.entity, attributes)];
                    case 3:
                        _a = _b.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.create(attributes)];
                    case 5:
                        _a = _b.sent();
                        _b.label = 6;
                    case 6:
                        item = _a;
                        return [2 /*return*/, entity_item_1.EntityItem.create(this.entity, item)];
                }
            });
        });
    };
    /**
     *
     */
    EntityAccessor.prototype.create = function (attributes) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, assocTo;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.entity.assocToInput;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        assocTo = _a[_i];
                        return [4 /*yield*/, this.createInlineInput(assocTo, attributes)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, this.dataStore.create(this.entity, attributes)];
                }
            });
        });
    };
    /**
     *
     */
    EntityAccessor.prototype.delete = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.deleter.deleteAssocFrom(id)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.dataStore.delete(this.entity, id)];
                }
            });
        });
    };
    /**
     *
     */
    EntityAccessor.prototype.truncate = function () {
        return this.dataStore.truncate(this.entity);
    };
    /**
     *
     */
    EntityAccessor.prototype.createInlineInput = function (assocTo, attrs) {
        return __awaiter(this, void 0, void 0, function () {
            var refEntity, input, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        refEntity = this.runtime.entities[assocTo.type];
                        input = lodash_1.default.get(attrs, refEntity.singular);
                        if (!input)
                            return [2 /*return*/];
                        if (lodash_1.default.has(attrs, refEntity.foreignKey))
                            throw new Error("'" + this.entity.name + " you cannot have '" + refEntity.foreignKey + "' if you provide inline input'");
                        return [4 /*yield*/, this.dataStore.create(refEntity, input)];
                    case 1:
                        item = _a.sent();
                        lodash_1.default.set(attrs, refEntity.foreignKey, lodash_1.default.toString(item.id));
                        lodash_1.default.unset(attrs, refEntity.singular);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     */
    EntityAccessor.prototype.setDefaultValues = function (attributes) {
        lodash_1.default.forEach(this.entity.attributes, function (attribute, name) {
            if (lodash_1.default.has(attributes, name) || lodash_1.default.isUndefined(attribute.defaultValue))
                return;
            lodash_1.default.set(attributes, name, attribute.defaultValue);
        });
    };
    return EntityAccessor;
}(entity_module_1.EntityModule));
exports.EntityAccessor = EntityAccessor;
