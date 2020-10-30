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
exports.EntityResolver = void 0;
var lodash_1 = __importDefault(require("lodash"));
var entity_item_1 = require("./entity-item");
var entity_module_1 = require("./entity-module");
//
//
var EntityResolver = /** @class */ (function (_super) {
    __extends(EntityResolver, _super);
    function EntityResolver() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(EntityResolver.prototype, "accessor", {
        get: function () { return this.entity.accessor; },
        enumerable: false,
        configurable: true
    });
    /**
     *
     */
    EntityResolver.prototype.resolveType = function (resolverCtx) {
        return __awaiter(this, void 0, void 0, function () {
            var id, enit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = lodash_1.default.get(resolverCtx.args, 'id');
                        return [4 /*yield*/, this.accessor.findById(id)];
                    case 1:
                        enit = _a.sent();
                        return [2 /*return*/, enit.item];
                }
            });
        });
    };
    /**
     *
     */
    EntityResolver.prototype.resolveTypes = function (resolverCtx) {
        return __awaiter(this, void 0, void 0, function () {
            var filter, sort, paging, enits;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.entity.entityPermissions.addPermissionToFilter(resolverCtx)];
                    case 1:
                        _a.sent();
                        filter = lodash_1.default.get(resolverCtx.args, 'filter');
                        sort = this.getSort(lodash_1.default.get(resolverCtx.args, 'sort'));
                        paging = lodash_1.default.get(resolverCtx.args, 'paging');
                        return [4 /*yield*/, this.accessor.findByFilter(filter, sort, paging)];
                    case 2:
                        enits = _a.sent();
                        return [2 /*return*/, lodash_1.default.map(enits, function (enit) { return enit.item; })];
                }
            });
        });
    };
    /**
     *
     */
    EntityResolver.prototype.getSort = function (sortString) {
        if (!sortString)
            return undefined;
        var parts = lodash_1.default.split(sortString, '_');
        if (parts.length !== 2)
            return this.warn("invalid sortString '" + sortString + "'", undefined);
        var field = lodash_1.default.first(parts);
        var direction = lodash_1.default.last(parts);
        if (lodash_1.default.includes(['ASC', 'DESC'], direction))
            return { field: field, direction: direction };
        this.warn("invalid direction '" + direction + "'", undefined);
    };
    /**
     *
     */
    EntityResolver.prototype.resolvePolymorphTypes = function (filter, sort) {
        return __awaiter(this, void 0, void 0, function () {
            var result, _loop_1, _i, _a, entity;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        result = [];
                        _loop_1 = function (entity) {
                            var enits;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, entity.accessor.findByFilter(filter)];
                                    case 1:
                                        enits = _a.sent();
                                        lodash_1.default.forEach(enits, function (enit) { return lodash_1.default.set(enit.item, '__typename', entity.typeName); });
                                        result.push(enits);
                                        return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, _a = this.entity.entities;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        entity = _a[_i];
                        return [5 /*yield**/, _loop_1(entity)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, lodash_1.default(result).flatten().compact().map(function (enit) { return enit.item; }).value()];
                }
            });
        });
    };
    /**
     *
     */
    EntityResolver.prototype.saveType = function (resolverCtx) {
        return __awaiter(this, void 0, void 0, function () {
            var attributes, fileInfos, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        attributes = lodash_1.default.get(resolverCtx.args, this.entity.singular);
                        return [4 /*yield*/, this.setFileValuesAndGetFileInfos(resolverCtx.args, attributes)];
                    case 1:
                        fileInfos = _a.sent();
                        this.setTimestamps(attributes);
                        return [4 /*yield*/, this.accessor.save(attributes)];
                    case 2:
                        result = _a.sent();
                        if (result instanceof entity_item_1.EntityItem) {
                            this.saveFiles(result.item.id, fileInfos);
                            return [2 /*return*/, lodash_1.default.set({ validationViolations: [] }, this.entity.singular, result.item)];
                        }
                        return [2 /*return*/, { validationViolations: result }];
                }
            });
        });
    };
    /**
     *
     */
    EntityResolver.prototype.deleteType = function (resolverCtx) {
        return __awaiter(this, void 0, void 0, function () {
            var id, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = resolverCtx.args.id;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.accessor.delete(id)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, []];
                    case 3:
                        error_1 = _a.sent();
                        return [2 /*return*/, [
                                'Error',
                                lodash_1.default.toString(error_1)
                            ]];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     */
    EntityResolver.prototype.resolveAssocToType = function (refEntity, resolverCtx) {
        return __awaiter(this, void 0, void 0, function () {
            var id, enit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = lodash_1.default.get(resolverCtx.root, refEntity.foreignKey);
                        if (lodash_1.default.isNil(id))
                            return [2 /*return*/, null];
                        if (refEntity.isPolymorph)
                            return [2 /*return*/, this.resolvePolymorphAssocTo(refEntity, resolverCtx, id)];
                        return [4 /*yield*/, refEntity.findById(id)];
                    case 1:
                        enit = _a.sent();
                        return [2 /*return*/, enit.item];
                }
            });
        });
    };
    /**
     *
     */
    EntityResolver.prototype.resolvePolymorphAssocTo = function (refEntity, resolverCtx, id) {
        return __awaiter(this, void 0, void 0, function () {
            var polymorphType, enit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        polymorphType = this.runtime.entities[lodash_1.default.get(resolverCtx.root, refEntity.typeField)];
                        return [4 /*yield*/, polymorphType.findById(id)];
                    case 1:
                        enit = _a.sent();
                        lodash_1.default.set(enit.item, '__typename', polymorphType.typeName);
                        return [2 /*return*/, enit.item];
                }
            });
        });
    };
    /**
     *
     */
    EntityResolver.prototype.resolveAssocToManyTypes = function (refEntity, resolverCtx) {
        return __awaiter(this, void 0, void 0, function () {
            var ids, enits;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (refEntity.isPolymorph)
                            return [2 /*return*/, this.resolvePolymorphAssocToMany(refEntity, resolverCtx)];
                        ids = lodash_1.default.map(lodash_1.default.get(resolverCtx.root, refEntity.foreignKeys), function (id) { return lodash_1.default.toString(id); });
                        return [4 /*yield*/, refEntity.findByIds(ids)];
                    case 1:
                        enits = _a.sent();
                        return [2 /*return*/, lodash_1.default.map(enits, function (enit) { return enit.item; })];
                }
            });
        });
    };
    /**
     *
     */
    EntityResolver.prototype.resolvePolymorphAssocToMany = function (refEntity, resolverCtx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw 'not implemented';
            });
        });
    };
    /**
     *
     */
    EntityResolver.prototype.resolveAssocFromTypes = function (refEntity, resolverCtx) {
        return __awaiter(this, void 0, void 0, function () {
            var id, fieldName, attr, enits;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = lodash_1.default.toString(resolverCtx.root.id);
                        fieldName = refEntity.isAssocToMany(this.entity) ? this.entity.foreignKeys : this.entity.foreignKey;
                        attr = lodash_1.default.set({}, fieldName, id);
                        if (refEntity.isPolymorph)
                            return [2 /*return*/, this.resolvePolymorphAssocFromTypes(refEntity, attr)];
                        return [4 /*yield*/, refEntity.findByAttribute(attr)];
                    case 1:
                        enits = _a.sent();
                        return [2 /*return*/, lodash_1.default.map(enits, function (enit) { return enit.item; })];
                }
            });
        });
    };
    /**
     *
     */
    EntityResolver.prototype.resolvePolymorphAssocFromTypes = function (refEntity, attr) {
        return __awaiter(this, void 0, void 0, function () {
            var result, _loop_2, _i, _a, entity;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        result = [];
                        _loop_2 = function (entity) {
                            var enits;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, entity.findByAttribute(attr)];
                                    case 1:
                                        enits = _a.sent();
                                        lodash_1.default.forEach(enits, function (enit) { return lodash_1.default.set(enit.item, '__typename', entity.typeName); });
                                        result.push(enits);
                                        return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, _a = refEntity.entities;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        entity = _a[_i];
                        return [5 /*yield**/, _loop_2(entity)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, lodash_1.default(result).flatten().compact().map(function (enit) { return enit.item; }).value()];
                }
            });
        });
    };
    /**
     *
     */
    EntityResolver.prototype.truncate = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.accessor.truncate()];
            });
        });
    };
    /**
     *
     */
    EntityResolver.prototype.setFileValuesAndGetFileInfos = function (args, attributes) {
        return __awaiter(this, void 0, void 0, function () {
            var fileInfos, _i, _a, name_1, attribute, fileInfo;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        fileInfos = [];
                        _i = 0, _a = lodash_1.default.keys(this.entity.attributes);
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        name_1 = _a[_i];
                        attribute = this.entity.attributes[name_1];
                        if (!this.entity.isFileAttribute(attribute))
                            return [3 /*break*/, 3];
                        return [4 /*yield*/, this.setFileValuesAndGetFileInfo(name_1, args, attributes)];
                    case 2:
                        fileInfo = _b.sent();
                        if (fileInfo)
                            fileInfos.push(fileInfo);
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, fileInfos];
                }
            });
        });
    };
    EntityResolver.prototype.setFileValuesAndGetFileInfo = function (name, args, attributes) {
        return __awaiter(this, void 0, void 0, function () {
            var filePromise;
            return __generator(this, function (_a) {
                filePromise = lodash_1.default.get(args, name);
                if (!filePromise)
                    return [2 /*return*/];
                return [2 /*return*/, new Promise(function (resolve) { return Promise.resolve(filePromise).then(function (value) {
                        lodash_1.default.set(attributes, name, lodash_1.default.pick(value, 'filename', 'encoding', 'mimetype'));
                        resolve({ name: name, filename: lodash_1.default.get(value, 'filename'), stream: value.createReadStream() });
                    }); })];
            });
        });
    };
    /**
     *
     */
    EntityResolver.prototype.saveFiles = function (id, fileInfos) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, fileInfos_1, fileInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _i = 0, fileInfos_1 = fileInfos;
                        _a.label = 1;
                    case 1:
                        if (!(_i < fileInfos_1.length)) return [3 /*break*/, 4];
                        fileInfo = fileInfos_1[_i];
                        return [4 /*yield*/, this.entity.fileSave.saveFile(id, fileInfo)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
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
    EntityResolver.prototype.setTimestamps = function (attributes) {
        var now = lodash_1.default.toString(Date.now());
        if (!attributes.id)
            lodash_1.default.set(attributes, 'createdAt', now);
        lodash_1.default.set(attributes, 'updatedAt', now);
    };
    return EntityResolver;
}(entity_module_1.EntityModule));
exports.EntityResolver = EntityResolver;
