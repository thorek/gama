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
exports.EntityItem = void 0;
var lodash_1 = __importDefault(require("lodash"));
//
//
var EntityItem = /** @class */ (function () {
    /**
     *
     */
    function EntityItem(entity, item) {
        this.entity = entity;
        this.item = item;
    }
    Object.defineProperty(EntityItem.prototype, "runtime", {
        get: function () { return this.entity.runtime; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EntityItem.prototype, "id", {
        get: function () { return lodash_1.default.toString(this.item.id); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EntityItem.prototype, "name", {
        get: function () { return this.entity.name; },
        enumerable: false,
        configurable: true
    });
    EntityItem.create = function (entity, item) {
        return __awaiter(this, void 0, void 0, function () {
            var entityItem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        entityItem = new EntityItem(entity, item);
                        return [4 /*yield*/, entityItem.defineVirtualAttributes()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, entityItem];
                }
            });
        });
    };
    /**
     *
     */
    EntityItem.prototype.assocTo = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var assocTo, foreignEntity, foreignKey, specificType;
            return __generator(this, function (_a) {
                assocTo = lodash_1.default.find(this.entity.assocTo, function (assocTo) { return assocTo.type === name; });
                if (!assocTo)
                    return [2 /*return*/, this.warn("no such assocTo '" + name + "'", undefined)];
                foreignEntity = this.runtime.entities[assocTo.type];
                if (!foreignEntity)
                    return [2 /*return*/, this.warn("assocTo '" + name + "' is no entity", undefined)];
                foreignKey = lodash_1.default.get(this.item, foreignEntity.foreignKey);
                if (foreignEntity.isPolymorph) {
                    specificType = lodash_1.default.get(this.item, foreignEntity.typeField);
                    foreignEntity = this.runtime.entities[specificType];
                    if (!foreignEntity)
                        return [2 /*return*/, undefined];
                }
                return [2 /*return*/, foreignKey ? foreignEntity.findById(foreignKey) : undefined];
            });
        });
    };
    /**
     *
     */
    EntityItem.prototype.assocToMany = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var assocToMany, foreignEntity, foreignKeys;
            return __generator(this, function (_a) {
                assocToMany = lodash_1.default.find(this.entity.assocToMany, function (assocToMany) { return assocToMany.type === name; });
                if (!assocToMany)
                    return [2 /*return*/, this.warn("no such assocToMany '" + name + "'", [])];
                foreignEntity = this.runtime.entities[assocToMany.type];
                if (!foreignEntity)
                    return [2 /*return*/, this.warn("assocToMany '" + name + "' is no entity", [])];
                foreignKeys = lodash_1.default.get(this.item, foreignEntity.foreignKeys);
                return [2 /*return*/, foreignEntity.findByIds(foreignKeys)];
            });
        });
    };
    /**
     *
     */
    EntityItem.prototype.assocFrom = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var assocFrom, foreignEntity, entites, enits, _i, entites_1, entity, foreignKey, attr, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        assocFrom = lodash_1.default.find(this.entity.assocFrom, function (assocFrom) { return assocFrom.type === name; });
                        if (!assocFrom)
                            return [2 /*return*/, this.warn("no such assocFrom '" + name + "'", [])];
                        foreignEntity = this.runtime.entities[assocFrom.type];
                        if (!foreignEntity)
                            return [2 /*return*/, this.warn("assocFrom '" + name + "' is no entity", [])];
                        entites = foreignEntity.isPolymorph ? foreignEntity.entities : [foreignEntity];
                        enits = [];
                        _i = 0, entites_1 = entites;
                        _d.label = 1;
                    case 1:
                        if (!(_i < entites_1.length)) return [3 /*break*/, 4];
                        entity = entites_1[_i];
                        foreignKey = entity.isAssocToMany(this.entity) ? this.entity.foreignKeys : this.entity.foreignKey;
                        attr = lodash_1.default.set({}, foreignKey, lodash_1.default.toString(this.item.id));
                        _b = (_a = enits.push).apply;
                        _c = [enits];
                        return [4 /*yield*/, entity.findByAttribute(attr)];
                    case 2:
                        _b.apply(_a, _c.concat([_d.sent()]));
                        _d.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, enits];
                }
            });
        });
    };
    /**
     *
     */
    EntityItem.prototype.save = function (skipValidation) {
        if (skipValidation === void 0) { skipValidation = false; }
        return __awaiter(this, void 0, void 0, function () {
            var allowed, attrs, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        allowed = this.getAllowedAttributes();
                        attrs = lodash_1.default.pick(this.item, allowed);
                        return [4 /*yield*/, this.entity.accessor.save(attrs, skipValidation)];
                    case 1:
                        item = _a.sent();
                        if (lodash_1.default.isArray(item))
                            throw this.getValidationError(item);
                        return [2 /*return*/, EntityItem.create(this.entity, item)];
                }
            });
        });
    };
    /**
     *
     */
    EntityItem.prototype.delete = function () {
        return this.entity.accessor.delete(this.id);
    };
    //
    //
    EntityItem.prototype.getAllowedAttributes = function () {
        var _this = this;
        var entities = lodash_1.default.compact(lodash_1.default.concat(this.entity, this.entity.implements));
        return lodash_1.default.concat('id', lodash_1.default.flatten(lodash_1.default.map(entities, function (entity) {
            return lodash_1.default.flatten(lodash_1.default.compact(lodash_1.default.concat(lodash_1.default.keys(entity.attributes), lodash_1.default(entity.assocTo).map(function (assocTo) {
                var entity = _this.runtime.entities[assocTo.type];
                if (!entity)
                    return;
                return entity.isPolymorph ? [entity.foreignKey, entity.typeField] : entity.foreignKey;
            }).compact().flatten().value(), lodash_1.default(_this.entity.assocToMany).map(function (assocTo) {
                var entity = _this.runtime.entities[assocTo.type];
                if (!entity)
                    return;
                return entity.isPolymorph ? [entity.foreignKeys, entity.typeField] : entity.foreignKeys;
            }).compact().flatten().value())));
        })));
    };
    //
    //
    EntityItem.prototype.defineVirtualAttributes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, name_1, attribute, value;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = lodash_1.default.keys(this.entity.attributes);
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        name_1 = _a[_i];
                        attribute = this.entity.attributes[name_1];
                        if (!lodash_1.default.isFunction(attribute.calculate))
                            return [3 /*break*/, 3];
                        return [4 /*yield*/, Promise.resolve(attribute.calculate(this.item))];
                    case 2:
                        value = _b.sent();
                        Object.defineProperty(this.item, name_1, { value: value });
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    //
    //
    EntityItem.prototype.warn = function (msg, returnValue) {
        console.warn("EntitItem '" + this.entity.name + "': " + msg);
        return returnValue;
    };
    //
    //
    EntityItem.prototype.getValidationError = function (violations) {
        var msg = [this.entity.name + "] could not save, there are validation violations"];
        msg.push.apply(msg, lodash_1.default.map(violations, function (violation) { return "[" + violation.attribute + "] " + violation.message; }));
        return new Error(lodash_1.default.join(msg, '\n'));
    };
    EntityItem.prototype.toString = function () { return "[" + this.entity.name + ":" + this.id + "]"; };
    return EntityItem;
}());
exports.EntityItem = EntityItem;
