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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaFactory = void 0;
var graphql_1 = require("graphql");
var lodash_1 = __importDefault(require("lodash"));
var entity_builder_1 = require("../builder/entity-builder");
var enum_builder_1 = require("../builder/enum-builder");
var mutation_builder_1 = require("../builder/mutation-builder");
var query_builder_1 = require("../builder/query-builder");
var config_entity_1 = require("../entities/config-entity");
//
//
var SchemaFactory = /** @class */ (function () {
    //
    //
    function SchemaFactory(runtime) {
        this.runtime = runtime;
    }
    Object.defineProperty(SchemaFactory.prototype, "config", {
        get: function () { return this.runtime.config; },
        enumerable: false,
        configurable: true
    });
    /**
     *
     */
    SchemaFactory.create = function (runtime) {
        return new SchemaFactory(runtime);
    };
    /**
     *
     */
    SchemaFactory.prototype.schema = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this._schema)
                            return [2 /*return*/, this._schema];
                        _a = this;
                        return [4 /*yield*/, this.createSchema(this.runtime)];
                    case 1:
                        _a._schema = _b.sent();
                        return [2 /*return*/, this._schema];
                }
            });
        });
    };
    /**
     *
     */
    SchemaFactory.prototype.builders = function () {
        if (this._builders)
            return this._builders;
        this._builders = lodash_1.default.compact(__spreadArrays([
            this.config.metaDataBuilder
        ], this.runtime.dataStore.getScalarFilterTypes(), this.getConfigTypeBuilder(), this.getCustomBuilders()));
        return this._builders;
    };
    /**
     *
     */
    SchemaFactory.prototype.getCustomBuilders = function () {
        var domainDefinition = this.runtime.domainDefinition;
        return lodash_1.default.compact(lodash_1.default.flatten(lodash_1.default.concat(lodash_1.default.get(this.config, 'schemaBuilder', []), lodash_1.default.map(domainDefinition.entities, function (entity) { return new entity_builder_1.EntityBuilder(entity); }), domainDefinition.enums)));
    };
    /**
     *
     */
    SchemaFactory.prototype.getConfigTypeBuilder = function () {
        var _this = this;
        var domainDefinition = this.runtime.domainDefinition;
        if (!domainDefinition)
            return [];
        var configuration = domainDefinition.getConfiguration();
        var builder = lodash_1.default.compact(lodash_1.default.map(configuration.entity, function (config, name) { return _this.createEntityBuilder(name, config); }));
        builder.push.apply(builder, lodash_1.default.compact(lodash_1.default.map(configuration.enum, function (config, name) { return _this.createEnumBuilder(name, config); })));
        builder.push.apply(builder, lodash_1.default.compact(lodash_1.default.map(configuration.query, function (config, name) { return _this.createQueryBuilder(name, config); })));
        builder.push.apply(builder, lodash_1.default.compact(lodash_1.default.map(configuration.mutation, function (config, name) { return _this.createMutationBuilder(name, config); })));
        return builder;
    };
    /**
     *
     */
    SchemaFactory.prototype.createEntityBuilder = function (name, config) {
        try {
            var entity = config_entity_1.ConfigEntity.create(name, config);
            return new entity_builder_1.EntityBuilder(entity);
        }
        catch (error) {
            console.log("Error building entity [" + name + "]", error);
        }
    };
    /**
     *
     */
    SchemaFactory.prototype.createEnumBuilder = function (name, config) {
        try {
            return enum_builder_1.EnumConfigBuilder.create(name, config);
        }
        catch (error) {
            console.log("Error building enum [" + name + "]", error);
        }
    };
    /**
     *
     */
    SchemaFactory.prototype.createQueryBuilder = function (name, config) {
        try {
            return query_builder_1.QueryConfigBuilder.create(name, config);
        }
        catch (error) {
            console.log("Error building query [" + name + "]", error);
        }
    };
    /**
     *
     */
    SchemaFactory.prototype.createMutationBuilder = function (name, config) {
        try {
            return mutation_builder_1.MutationConfigBuilder.create(name, config);
        }
        catch (error) {
            console.log("Error building mutation [" + name + "]", error);
        }
    };
    /**
     *
     */
    SchemaFactory.prototype.createSchema = function (runtime) {
        return __awaiter(this, void 0, void 0, function () {
            var schema;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        runtime.graphx.init(runtime);
                        this.createScalars(runtime);
                        return [4 /*yield*/, this.buildFromBuilders(runtime)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.extendSchema(runtime)];
                    case 2:
                        _a.sent();
                        schema = runtime.graphx.generate();
                        return [2 /*return*/, schema];
                }
            });
        });
    };
    SchemaFactory.prototype.buildFromBuilders = function (runtime) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lodash_1.default.forEach(this.builders(), function (type) { return type.init(runtime); });
                        lodash_1.default.forEach(this.builders(), function (type) { return type.build(); });
                        return [4 /*yield*/, this.extendTypeBuilders(runtime)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SchemaFactory.prototype.extendSchema = function (runtime) {
        return __awaiter(this, void 0, void 0, function () {
            var extendSchemaFn;
            return __generator(this, function (_a) {
                extendSchemaFn = runtime.domainDefinition.extendSchema;
                if (lodash_1.default.isFunction(extendSchemaFn))
                    extendSchemaFn(runtime);
                return [2 /*return*/];
            });
        });
    };
    SchemaFactory.prototype.extendTypeBuilders = function (runtime) {
        return __awaiter(this, void 0, void 0, function () {
            var entityBuilders, enumBuilders, _i, _a, entity, extendFn;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        entityBuilders = lodash_1.default.filter(this.builders(), function (builder) { return builder instanceof entity_builder_1.EntityBuilder; });
                        enumBuilders = lodash_1.default.filter(this.builders(), function (builder) { return builder instanceof enum_builder_1.EnumBuilder; });
                        lodash_1.default.forEach(entityBuilders, function (builder) { return builder.createUnionType(); });
                        lodash_1.default.forEach(entityBuilders, function (builder) { return builder.extendTypes(); });
                        lodash_1.default.forEach(enumBuilders, function (builder) { return builder.extendTypes(); });
                        _i = 0, _a = lodash_1.default.values(runtime.entities);
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        entity = _a[_i];
                        extendFn = entity.extendEntity();
                        if (!lodash_1.default.isFunction(extendFn)) return [3 /*break*/, 3];
                        return [4 /*yield*/, Promise.resolve(extendFn(runtime))];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SchemaFactory.prototype.createScalars = function (runtime) {
        runtime.graphx.type('Date', {
            name: 'Date',
            from: graphql_1.GraphQLScalarType,
            parseValue: function (value) { return new Date(value); },
            parseLiteral: function (ast) { return ast.kind === graphql_1.Kind.STRING ? new Date(ast.value) : null; },
            serialize: function (value) { return value instanceof Date ? value.toJSON() : "[" + value + "]"; }
        });
    };
    return SchemaFactory;
}());
exports.SchemaFactory = SchemaFactory;
