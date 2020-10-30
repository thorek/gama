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
exports.MongoDbDataStore = void 0;
// import ts from 'es6-template-strings';
var lodash_1 = __importDefault(require("lodash"));
var mongodb_1 = require("mongodb");
var data_store_1 = require("../core/data-store");
var boolean_filter_type_1 = require("./filter/boolean-filter-type");
var date_filter_type_1 = require("./filter/date-filter-type");
var enum_filter_type_1 = require("./filter/enum-filter-type");
var int_filter_type_1 = require("./filter/int-filter-type");
var string_filter_type_1 = require("./filter/string-filter-type");
/**
 *
 */
var MongoDbDataStore = /** @class */ (function (_super) {
    __extends(MongoDbDataStore, _super);
    /**
     *
     */
    function MongoDbDataStore(db) {
        var _this = _super.call(this) || this;
        _this.db = db;
        return _this;
    }
    /**
     *
     */
    MongoDbDataStore.create = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDb(config)];
                    case 1:
                        db = _a.sent();
                        return [2 /*return*/, new MongoDbDataStore(db)];
                }
            });
        });
    };
    /**
     *
     */
    MongoDbDataStore.getDb = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var url, dbName, client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = lodash_1.default.get(config, 'url');
                        if (!url)
                            throw "please provide url";
                        dbName = lodash_1.default.get(config, 'dbName');
                        if (!dbName)
                            throw "please provide dbName";
                        return [4 /*yield*/, mongodb_1.MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.db(dbName)];
                }
            });
        });
    };
    /**
     *
     */
    MongoDbDataStore.prototype.findById = function (entity, id) {
        return __awaiter(this, void 0, void 0, function () {
            var collection, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(id instanceof mongodb_1.ObjectId))
                            id = this.getObjectId(id, entity);
                        collection = this.getCollection(entity);
                        return [4 /*yield*/, collection.findOne(id)];
                    case 1:
                        item = _a.sent();
                        return [2 /*return*/, this.buildOutItem(item)];
                }
            });
        });
    };
    /**
     *
     */
    MongoDbDataStore.prototype.findByIds = function (entity, ids) {
        return __awaiter(this, void 0, void 0, function () {
            var collection, items;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ids = lodash_1.default.map(ids, function (id) { return _this.getObjectId(id, entity); });
                        collection = this.getCollection(entity);
                        return [4 /*yield*/, collection.find({ _id: { $in: ids } }).toArray()];
                    case 1:
                        items = _a.sent();
                        return [2 /*return*/, lodash_1.default.map(items, function (item) { return _this.buildOutItem(item); })];
                }
            });
        });
    };
    /**
     *
     */
    MongoDbDataStore.prototype.findByAttribute = function (entity, attrValue, sort) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.findByExpression(entity, attrValue, sort)];
            });
        });
    };
    /**
     *
     */
    MongoDbDataStore.prototype.findByFilter = function (entity, filter, sort, paging) {
        return __awaiter(this, void 0, void 0, function () {
            var expression;
            return __generator(this, function (_a) {
                expression = this.buildExpression(entity, filter);
                return [2 /*return*/, this.findByExpression(entity, expression, sort, paging)];
            });
        });
    };
    MongoDbDataStore.prototype.aggregateFind = function (entities, filter, sort, paging) {
        return __awaiter(this, void 0, void 0, function () {
            var expression, lookups, concatArrays, aggregateDefinition, randomEntity, sortStage, sl, aggregate, items;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (entities.length === 0)
                            return [2 /*return*/, []];
                        expression = this.buildExpression(lodash_1.default.first(entities), filter);
                        lookups = lodash_1.default.map(entities, function (entity) { return ({
                            $lookup: {
                                from: entity.typesQuery,
                                pipeline: [
                                    { $addFields: { __typename: entity.typeName } },
                                ],
                                as: entity.typesQuery
                            }
                        }); });
                        concatArrays = lodash_1.default.map(entities, function (entity) { return "$" + entity.typesQuery; });
                        aggregateDefinition = lodash_1.default.compact(lodash_1.default.concat({ $limit: 1 }, { $project: { _id: '$$REMOVE' } }, lookups, { $project: { union: { $concatArrays: concatArrays } } }, { $unwind: '$union' }, { $replaceRoot: { newRoot: '$union' } }, { $sort: this.getSort(sort) }));
                        randomEntity = lodash_1.default.first(entities);
                        sortStage = this.getSort(sort);
                        sl = this.getSkipLimit(paging);
                        if (sl.limit === 0)
                            sl.limit = Number.MAX_SAFE_INTEGER;
                        aggregate = this.getCollection(randomEntity).aggregate(aggregateDefinition).match(expression);
                        return [4 /*yield*/, aggregate.sort(sortStage).skip(sl.skip).limit(sl.limit).toArray()];
                    case 1:
                        items = _a.sent();
                        return [2 /*return*/, lodash_1.default.map(items, function (item) { return _this.buildOutItem(item); })];
                }
            });
        });
    };
    /**
     *
     */
    MongoDbDataStore.prototype.create = function (entity, attrs) {
        return __awaiter(this, void 0, void 0, function () {
            var collection, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        collection = this.getCollection(entity);
                        return [4 /*yield*/, collection.insertOne(attrs)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, this.findById(entity, result.insertedId)];
                }
            });
        });
    };
    /**
     *
     */
    MongoDbDataStore.prototype.update = function (entity, attrs) {
        return __awaiter(this, void 0, void 0, function () {
            var _id, collection, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _id = new mongodb_1.ObjectId(attrs.id);
                        delete attrs.id;
                        collection = this.getCollection(entity);
                        return [4 /*yield*/, collection.updateOne({ _id: _id }, { $set: attrs }, { upsert: false })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, this.findById(entity, _id)];
                }
            });
        });
    };
    /**
     *
     */
    MongoDbDataStore.prototype.delete = function (entityType, id) {
        return __awaiter(this, void 0, void 0, function () {
            var collection;
            return __generator(this, function (_a) {
                collection = this.getCollection(entityType);
                collection.deleteOne({ _id: new mongodb_1.ObjectId(id) });
                return [2 /*return*/, true];
            });
        });
    };
    /**
     *
     */
    MongoDbDataStore.prototype.truncate = function (entity) {
        return __awaiter(this, void 0, void 0, function () {
            var collectionName, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        collectionName = entity.collection;
                        return [4 /*yield*/, this.collectionExist(collectionName)];
                    case 1:
                        if (!_a.sent()) return [3 /*break*/, 5];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.db.dropCollection(collectionName)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 4:
                        error_1 = _a.sent();
                        console.error(error_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, false];
                }
            });
        });
    };
    /**
     *
     */
    MongoDbDataStore.prototype.getEnumFilterType = function (enumName) {
        return new enum_filter_type_1.EnumFilterType(enumName);
    };
    /**
     *
     */
    MongoDbDataStore.prototype.getScalarFilterTypes = function () {
        return [
            new string_filter_type_1.StringFilterType(),
            new int_filter_type_1.IntFilterType(),
            new boolean_filter_type_1.BooleanFilterType(),
            new date_filter_type_1.DateFilterType()
        ];
    };
    /**
     *
     */
    MongoDbDataStore.prototype.getObjectId = function (id, entity) {
        if (!id)
            throw new Error("cannot resolve type '" + entity.name + "' without id");
        try {
            return new mongodb_1.ObjectId(lodash_1.default.toString(id));
        }
        catch (error) {
            throw new Error("could not convert '" + id + "' for '" + entity.name + "' to an ObjectId");
        }
    };
    /**
     *
     */
    MongoDbDataStore.prototype.findByExpression = function (entity, expression, sort, paging) {
        return __awaiter(this, void 0, void 0, function () {
            var collection, sortStage, sl, items;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        collection = this.getCollection(entity);
                        sortStage = this.getSort(sort);
                        sl = this.getSkipLimit(paging);
                        return [4 /*yield*/, collection.find(expression).sort(sortStage).skip(sl.skip).limit(sl.limit).toArray()];
                    case 1:
                        items = _a.sent();
                        return [2 /*return*/, lodash_1.default.map(items, function (item) { return _this.buildOutItem(item); })];
                }
            });
        });
    };
    /**
     *
     */
    MongoDbDataStore.prototype.buildExpression = function (entity, filter) {
        var filterQuery = {};
        lodash_1.default.forEach(filter, function (condition, field) {
            var attribute = entity.getAttribute(field);
            if (!attribute)
                return lodash_1.default.set(filterQuery, field, condition);
            var filterType = entity.runtime.filterType(attribute.filterType, attribute.graphqlType);
            if (!filterType)
                return;
            var expression = filterType.getFilterExpression(condition, field);
            if (expression)
                lodash_1.default.set(filterQuery, field, expression);
        });
        return filterQuery;
    };
    /**
     *
     */
    MongoDbDataStore.prototype.getCollection = function (entity) {
        return this.db.collection(entity.collection);
    };
    /**
     *
     */
    MongoDbDataStore.prototype.buildOutItem = function (entity) {
        if (!lodash_1.default.has(entity, '_id'))
            return null;
        lodash_1.default.set(entity, 'id', entity._id);
        lodash_1.default.unset(entity, '_id');
        return entity;
    };
    /**
     *
     */
    MongoDbDataStore.prototype.collectionExist = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var collection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.listCollections({ name: name }).next()];
                    case 1:
                        collection = _a.sent();
                        return [2 /*return*/, collection != null];
                }
            });
        });
    };
    // TODO permissions
    /**
     *
     */
    MongoDbDataStore.prototype.addPermittedIds = function (filter, ids) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (ids === true)
                    return [2 /*return*/, filter];
                if (ids === false)
                    ids = [];
                return [2 /*return*/, { $and: [{ _id: { $in: ids } }, filter] }];
            });
        });
    };
    /**
     *
     */
    MongoDbDataStore.prototype.getPermittedIds = function (entity, permission, resolverCtx) {
        return __awaiter(this, void 0, void 0, function () {
            var expression, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        expression = lodash_1.default.get(permission, 'filter');
                        if (lodash_1.default.isString(expression)) {
                            // expression = ts( expression, resolverCtx.context );
                            expression = JSON.parse(expression);
                        }
                        else {
                            expression = this.buildPermittedIdsFilter(entity, permission, resolverCtx.context);
                        }
                        return [4 /*yield*/, this.findByExpression(entity, expression)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, lodash_1.default.map(result, function (item) { return lodash_1.default.get(item, '_id'); })];
                }
            });
        });
    };
    /**
     *
     */
    MongoDbDataStore.prototype.getPermittedIdsForForeignKeys = function (entity, assocTo, foreignKeys) {
        return __awaiter(this, void 0, void 0, function () {
            var expression, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        foreignKeys = lodash_1.default.map(foreignKeys, function (key) { return key.toString(); });
                        expression = lodash_1.default.set({}, assocTo, { $in: foreignKeys });
                        return [4 /*yield*/, this.findByExpression(entity, expression)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, lodash_1.default.map(result, function (item) { return lodash_1.default.get(item, '_id'); })];
                }
            });
        });
    };
    /**
     *  all:
     *    - read
     *    - status:
     *        - draft
     *        - open
     *      name: user.assignedContracts  # will be resolved with context
     */
    MongoDbDataStore.prototype.buildPermittedIdsFilter = function (entity, permission, context) {
        var _this = this;
        var conditions = [];
        lodash_1.default.forEach(permission, function (values, attribute) {
            if (lodash_1.default.isArray(values)) {
                values = lodash_1.default.map(values, function (value) { return lodash_1.default.get(context, value, value); });
                conditions.push(lodash_1.default.set({}, attribute, { $in: values }));
            }
            else {
                values = _this.resolvePermissionValue(entity, attribute, values, context);
                if (attribute === '_id')
                    values = new mongodb_1.ObjectId(values);
                conditions.push(lodash_1.default.set({}, attribute, { $eq: values }));
            }
        });
        return lodash_1.default.size(conditions) > 1 ? { $and: conditions } : lodash_1.default.first(conditions);
    };
    /**
     *
     */
    MongoDbDataStore.prototype.resolvePermissionValue = function (entity, attribute, value, context) {
        value = lodash_1.default.get(context, value, value);
        return attribute === '_id' || entity.isAssocToAttribute(attribute) ? new mongodb_1.ObjectId(value) : value;
    };
    MongoDbDataStore.prototype.getSort = function (sort) {
        return lodash_1.default.isUndefined(sort) ? { _id: -1 } : lodash_1.default.set({}, sort.field, sort.direction === 'ASC' ? 1 : -1);
    };
    MongoDbDataStore.prototype.getSkipLimit = function (paging) {
        if (!paging)
            return { skip: 0, limit: 0 };
        return { skip: paging.page * paging.size, limit: paging.size };
    };
    return MongoDbDataStore;
}(data_store_1.DataStore));
exports.MongoDbDataStore = MongoDbDataStore;
