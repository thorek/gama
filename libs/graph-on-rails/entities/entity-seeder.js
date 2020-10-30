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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.EntitySeeder = void 0;
var lodash_1 = __importDefault(require("lodash"));
var FakerDE = __importStar(require("faker/locale/de"));
var FakerEN = __importStar(require("faker/locale/en"));
var entity_module_1 = require("./entity-module");
var entity_item_1 = require("./entity-item");
var fakers = { de: FakerDE, en: FakerEN };
/**
 *
 */
var EntitySeeder = /** @class */ (function (_super) {
    __extends(EntitySeeder, _super);
    function EntitySeeder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     *
     */
    EntitySeeder.prototype.truncate = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.entity.resolver.truncate()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     *
     */
    EntitySeeder.prototype.seedAttributes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ids;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ids = {};
                        if (!lodash_1.default.has(this.entity.seeds, 'Faker')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.generateFaker(lodash_1.default.get(this.entity.seeds, 'Faker'))];
                    case 1:
                        _a.sent();
                        lodash_1.default.unset(this.entity.seeds, 'Faker');
                        _a.label = 2;
                    case 2: return [4 /*yield*/, Promise.all(lodash_1.default.map(this.entity.seeds, function (seed) { return _this.resolveFnProperties(seed); }))];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, Promise.all(lodash_1.default.map(this.entity.seeds, function (seed, name) { return _this.seedInstanceAttributes(name, seed, ids); }))];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, lodash_1.default.set({}, this.entity.typeName, ids)];
                }
            });
        });
    };
    /**
     *
     */
    EntitySeeder.prototype.seedReferences = function (idsMap) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(lodash_1.default.map(this.entity.seeds, function (seed, name) { return __awaiter(_this, void 0, void 0, function () {
                            var assocTos, assocToManys;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        assocTos = lodash_1.default.concat(this.entity.assocTo, lodash_1.default.flatten(lodash_1.default.map(this.entity.implements, function (impl) { return impl.assocTo; })));
                                        return [4 /*yield*/, Promise.all(lodash_1.default.map(assocTos, function (assocTo) { return __awaiter(_this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0: return [4 /*yield*/, this.seedAssocTo(assocTo, seed, idsMap, name)];
                                                        case 1:
                                                            _a.sent();
                                                            return [2 /*return*/];
                                                    }
                                                });
                                            }); }))];
                                    case 1:
                                        _a.sent();
                                        assocToManys = lodash_1.default.concat(this.entity.assocToMany, lodash_1.default.flatten(lodash_1.default.map(this.entity.implements, function (impl) { return impl.assocToMany; })));
                                        return [4 /*yield*/, Promise.all(lodash_1.default.map(assocToManys, function (assocToMany) { return __awaiter(_this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0: return [4 /*yield*/, this.seedAssocToMany(assocToMany, seed, idsMap, name)];
                                                        case 1:
                                                            _a.sent();
                                                            return [2 /*return*/];
                                                    }
                                                });
                                            }); }))];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     */
    EntitySeeder.prototype.generateFaker = function (fakerSeed) {
        return __awaiter(this, void 0, void 0, function () {
            var count, i, seed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        count = fakerSeed.count || 30;
                        delete fakerSeed.count;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < count)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.generateFakeSeed(fakerSeed)];
                    case 2:
                        seed = _a.sent();
                        if (seed)
                            lodash_1.default.set(this.entity.seeds, "Fake-" + i, seed);
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     */
    EntitySeeder.prototype.generateFakeSeed = function (fakerSeed) {
        return __awaiter(this, void 0, void 0, function () {
            var seed, _i, _a, name_1, value;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        seed = {};
                        _i = 0, _a = lodash_1.default.keys(fakerSeed);
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        name_1 = _a[_i];
                        value = fakerSeed[name_1];
                        if (!!this.entity.isAssoc(name_1)) return [3 /*break*/, 3];
                        if (value.every) {
                            if (lodash_1.default.random(value.every) !== 1)
                                return [3 /*break*/, 4];
                            value = value.value;
                        }
                        return [4 /*yield*/, this.evalFake(value, seed)];
                    case 2:
                        value = _b.sent();
                        _b.label = 3;
                    case 3:
                        ;
                        lodash_1.default.set(seed, name_1, value);
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, seed];
                }
            });
        });
    };
    /**
     *
     */
    EntitySeeder.prototype.resolveFnProperties = function (seed) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, attribute, property, value;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = lodash_1.default.keys(this.entity.attributes);
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        attribute = _a[_i];
                        property = lodash_1.default.get(seed, attribute);
                        if (!lodash_1.default.isFunction(property)) return [3 /*break*/, 3];
                        return [4 /*yield*/, Promise.resolve(property())];
                    case 2:
                        value = _b.sent();
                        lodash_1.default.set(seed, attribute, value);
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     */
    EntitySeeder.prototype.seedInstanceAttributes = function (name, seed, ids) {
        return __awaiter(this, void 0, void 0, function () {
            var enit, id, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, entity_item_1.EntityItem.create(this.entity, seed)];
                    case 1:
                        enit = _a.sent();
                        return [4 /*yield*/, enit.save(true)];
                    case 2:
                        enit = _a.sent();
                        if (!enit)
                            throw "seed '" + name + "' could not be saved";
                        id = enit.item.id;
                        if (!id)
                            throw "seed '" + name + "' has no id";
                        lodash_1.default.set(ids, name, id);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error("Entity '" + this.entity.typeName + "' could not seed an instance", seed, error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     */
    EntitySeeder.prototype.seedAssocTo = function (assocTo, seed, idsMap, name) {
        return __awaiter(this, void 0, void 0, function () {
            var refEntity, value, id, _a, refType, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        refEntity = this.runtime.entities[assocTo.type];
                        if (!refEntity || !lodash_1.default.has(seed, refEntity.typeName))
                            return [2 /*return*/];
                        value = lodash_1.default.get(seed, refEntity.typeName);
                        if (!lodash_1.default.startsWith(name, 'Fake')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.evalFake(value, seed, idsMap)];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = lodash_1.default.isString(value) ?
                            lodash_1.default.get(idsMap, [refEntity.typeName, value]) :
                            lodash_1.default.get(idsMap, [value.type, value.id]);
                        _b.label = 3;
                    case 3:
                        id = _a;
                        refType = lodash_1.default.get(value, 'type');
                        if (!id) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.updateAssocTo(idsMap, name, refEntity, id, refType)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_2 = _b.sent();
                        console.error("Entity '" + this.entity.typeName + "' could not seed a reference", assocTo, name, error_2);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     */
    EntitySeeder.prototype.seedAssocToMany = function (assocToMany, seed, idsMap, name) {
        return __awaiter(this, void 0, void 0, function () {
            var refEntity_1, value, refIds, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        refEntity_1 = this.runtime.entities[assocToMany.type];
                        if (!refEntity_1 || !lodash_1.default.has(seed, refEntity_1.typeName))
                            return [2 /*return*/];
                        value = lodash_1.default.get(seed, refEntity_1.typeName);
                        refIds = undefined;
                        if (!lodash_1.default.startsWith(name, 'Fake')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.evalFake(value, seed, idsMap)];
                    case 1:
                        refIds = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        if (!lodash_1.default.isArray(value))
                            value = [value];
                        refIds = lodash_1.default.compact(lodash_1.default.map(value, function (refName) { return lodash_1.default.get(idsMap, [refEntity_1.typeName, refName]); }));
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.updateAssocToMany(idsMap, name, refEntity_1, refIds)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_3 = _a.sent();
                        console.error("Entity '" + this.entity.typeName + "' could not seed a reference", assocToMany, name, error_3);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     */
    EntitySeeder.prototype.updateAssocTo = function (idsMap, name, refEntity, refId, refType) {
        return __awaiter(this, void 0, void 0, function () {
            var id, enit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = lodash_1.default.get(idsMap, [this.entity.typeName, name]);
                        if (!id)
                            return [2 /*return*/, console.warn("[" + this.entity.name + "] cannot update assocTo, no id for '" + refEntity.name + "'." + name)];
                        return [4 /*yield*/, this.entity.findById(id)];
                    case 1:
                        enit = _a.sent();
                        lodash_1.default.set(enit.item, refEntity.foreignKey, lodash_1.default.toString(refId));
                        if (refType)
                            lodash_1.default.set(enit.item, refEntity.typeField, refType);
                        return [4 /*yield*/, enit.save(true)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     */
    EntitySeeder.prototype.updateAssocToMany = function (idsMap, name, refEntity, refIds) {
        return __awaiter(this, void 0, void 0, function () {
            var id, enit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        refIds = lodash_1.default.map(refIds, function (refId) { return lodash_1.default.toString(refId); });
                        id = lodash_1.default.get(idsMap, [this.entity.typeName, name]);
                        return [4 /*yield*/, this.entity.findById(id)];
                    case 1:
                        enit = _a.sent();
                        lodash_1.default.set(enit.item, refEntity.foreignKeys, refIds);
                        return [4 /*yield*/, enit.save(true)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     */
    EntitySeeder.prototype.evalFake = function (value, seed, idsMap) {
        return __awaiter(this, void 0, void 0, function () {
            var locale, faker, ld;
            return __generator(this, function (_a) {
                locale = lodash_1.default.get(this.runtime.config.domainDefinition, 'locale', 'en');
                faker = lodash_1.default.get(fakers, locale, FakerEN);
                ld = lodash_1.default;
                try {
                    return [2 /*return*/, lodash_1.default.isFunction(value) ?
                            Promise.resolve(value({ idsMap: idsMap, seed: seed, runtime: this.runtime })) :
                            (function (expression) { return eval(expression); }).call({}, value)];
                }
                catch (error) {
                    console.error("could not evaluate '" + value + "'\n", error);
                }
                return [2 /*return*/];
            });
        });
    };
    return EntitySeeder;
}(entity_module_1.EntityModule));
exports.EntitySeeder = EntitySeeder;
