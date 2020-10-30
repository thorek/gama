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
exports.Entity = void 0;
var inflection_1 = __importDefault(require("inflection"));
var lodash_1 = __importDefault(require("lodash"));
var entity_accessor_1 = require("./entity-accessor");
var entity_validator_1 = require("./entity-validator");
//
//
var Entity = /** @class */ (function () {
    function Entity() {
    }
    Object.defineProperty(Entity.prototype, "runtime", {
        get: function () { return this._runtime; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "graphx", {
        get: function () { return this.runtime.graphx; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "entityPermissions", {
        get: function () { return this._entityPermissions; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "seeder", {
        get: function () { return this._entitySeeder; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "resolver", {
        get: function () { return this._entityResolver; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "validator", {
        get: function () { return this._entityValidator; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "accessor", {
        get: function () { return this._entityAccessor; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "fileSave", {
        get: function () { return this._entityFileSave; },
        enumerable: false,
        configurable: true
    });
    /**
     *
     */
    Entity.prototype.init = function (runtime) {
        this._runtime = runtime;
        this.runtime.entities[this.typeName] = this;
        this._entityResolver = this.runtime.entityResolver(this);
        this._entitySeeder = this.runtime.entitySeeder(this);
        this._entityPermissions = this.runtime.entityPermissions(this);
        this._entityFileSave = this.runtime.entityFileSave(this);
        this._entityValidator = new entity_validator_1.EntityValidator(this);
        this._entityAccessor = new entity_accessor_1.EntityAccessor(this);
    };
    Entity.prototype.extendEntity = function () { };
    Object.defineProperty(Entity.prototype, "name", {
        get: function () { return this.getName(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "typeName", {
        get: function () { return this.getTypeName(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "attributes", {
        get: function () { return this.getAttributes(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "assocTo", {
        get: function () { return this.getAssocTo(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "assocToInput", {
        get: function () { return lodash_1.default.filter(this.getAssocTo(), function (assocTo) { return assocTo.input === true; }); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "assocToMany", {
        get: function () { return this.getAssocToMany(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "assocFrom", {
        get: function () { return this.getAssocFrom(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "singular", {
        get: function () { return this.getSingular(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "plural", {
        get: function () { return this.getPlural(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "foreignKey", {
        get: function () { return this.getForeignKey(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "foreignKeys", {
        get: function () { return this.getForeignKeys(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "createInput", {
        get: function () { return this.getCreateInput(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "updateInput", {
        get: function () { return this.getUpdateInput(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "filterName", {
        get: function () { return this.getFilterName(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "sorterEnumName", {
        get: function () { return this.getSorterEnumName(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "collection", {
        get: function () { return this.getCollection(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "enum", {
        get: function () { return this.getEnum(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "seeds", {
        get: function () { return this.getSeeds(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "permissions", {
        get: function () { return this.getPermissions(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "description", {
        get: function () { return this.getDescription(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "entities", {
        get: function () { return this.getEntites(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "typeField", {
        get: function () { return this.getTypeField(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "typesEnumName", {
        get: function () { return this.getTypeEnumName(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "isInterface", {
        get: function () { return this.getIsInterface(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "isUnion", {
        get: function () { return !this.isInterface && !lodash_1.default.isEmpty(this.entities); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "isPolymorph", {
        get: function () { return this.isUnion || this.isInterface; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "implements", {
        get: function () { return lodash_1.default.filter(this.getImplements(), function (entity) { return entity.isInterface; }); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "deleteMutation", {
        get: function () { return this.getDeleteMutation(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "createMutation", {
        get: function () { return this.getCreateMutation(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "updateMutation", {
        get: function () { return this.getUpdateMutation(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "mutationResultName", {
        get: function () { return this.getMutationResultName(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "typesQuery", {
        get: function () { return this.getTypesQuery(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "typeQuery", {
        get: function () { return this.getTypeQuery(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "path", {
        get: function () { return this.getPath(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "assign", {
        get: function () { return this.getAssign(); },
        enumerable: false,
        configurable: true
    });
    Entity.prototype.getTypeName = function () { return inflection_1.default.camelize(this.name); };
    Entity.prototype.getSingular = function () { return "" + lodash_1.default.toLower(this.typeName.substring(0, 1)) + this.typeName.substring(1); };
    Entity.prototype.getPlural = function () { return inflection_1.default.pluralize(this.singular); };
    Entity.prototype.getForeignKey = function () { return this.singular + "Id"; };
    Entity.prototype.getForeignKeys = function () { return this.singular + "Ids"; };
    Entity.prototype.getCreateInput = function () { return this.typeName + "CreateInput"; };
    Entity.prototype.getUpdateInput = function () { return this.typeName + "UpdateInput"; };
    Entity.prototype.getFilterName = function () { return this.typeName + "Filter"; };
    Entity.prototype.getSorterEnumName = function () { return this.typeName + "Sort"; };
    Entity.prototype.getCollection = function () { return this.plural; };
    Entity.prototype.getAttributes = function () { return {}; };
    ;
    Entity.prototype.getAssocTo = function () { return []; };
    Entity.prototype.getAssocToMany = function () { return []; };
    Entity.prototype.getAssocFrom = function () { return []; };
    Entity.prototype.getEnum = function () { return {}; };
    Entity.prototype.getSeeds = function () { return {}; };
    Entity.prototype.getPermissions = function () { return undefined; };
    Entity.prototype.getDescription = function () { return; };
    Entity.prototype.getEntites = function () { return []; };
    Entity.prototype.getIsInterface = function () { return false; };
    Entity.prototype.getImplements = function () { return []; };
    Entity.prototype.getTypeField = function () { return this.singular + "Type"; };
    Entity.prototype.getTypeEnumName = function () { return this.typeName + "Types"; };
    Entity.prototype.getCreateMutation = function () { return "create" + this.typeName; };
    Entity.prototype.getUpdateMutation = function () { return "update" + this.typeName; };
    Entity.prototype.getMutationResultName = function () { return "Save" + this.typeName + "MutationResult"; };
    Entity.prototype.getTypesQuery = function () { return this.plural; };
    Entity.prototype.getTypeQuery = function () { return this.singular; };
    Entity.prototype.getDeleteMutation = function () { return "delete" + this.typeName; };
    Entity.prototype.getPath = function () { return inflection_1.default.underscore(this.plural); };
    Entity.prototype.getAssign = function () { return undefined; };
    /**
     *
     */
    Entity.prototype.getAttribute = function (name) {
        var attribute = this.attributes[name];
        if (attribute)
            return attribute;
        var implAttributes = lodash_1.default.map(this.implements, function (impl) { return impl.getAttribute(name); });
        return lodash_1.default.first(lodash_1.default.compact(implAttributes));
    };
    /**
     *
     */
    Entity.prototype.isAssoc = function (name) {
        if (lodash_1.default.find(this.assocTo, function (assocTo) { return assocTo.type === name; }))
            return true;
        if (lodash_1.default.find(this.assocToMany, function (assocTo) { return assocTo.type === name; }))
            return true;
        if (lodash_1.default.find(this.assocFrom, function (assocTo) { return assocTo.type === name; }))
            return true;
        return false;
    };
    /**
     *
     */
    Entity.prototype.isAssocToAttribute = function (attribute) {
        var _this = this;
        return lodash_1.default.find(this.assocTo, function (assocTo) {
            var ref = _this.runtime.entities[assocTo.type];
            return ref && ref.foreignKey === attribute;
        }) != null;
    };
    /**
     *
     */
    Entity.prototype.isAssocToMany = function (ref) {
        return lodash_1.default.find(this.assocToMany, function (assocToMany) { return assocToMany.type === ref.typeName; }) != undefined;
    };
    /**
     *
     */
    Entity.prototype.isFileAttribute = function (attribute) {
        var name = lodash_1.default.isString(attribute.graphqlType) ?
            attribute.graphqlType : lodash_1.default.get(attribute.graphqlType, 'name');
        return name === 'file';
    };
    /**
     *
     */
    Entity.prototype.getPermittedIds = function (action, resolverCtx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.entityPermissions)
                    throw new Error('no EntityPermission provider');
                return [2 /*return*/, this.entityPermissions.getPermittedIds(action, resolverCtx)];
            });
        });
    };
    /**
     *
     */
    Entity.prototype.validate = function (attributes) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.validator.validate(attributes)];
            });
        });
    };
    /**
     * @returns true if the given entity is an interface and this entity implements it
     */
    Entity.prototype.implementsEntityInterface = function (entity) {
        if (!entity.isInterface)
            return false;
        return lodash_1.default.includes(this.implements, entity);
    };
    /**
     *
     */
    Entity.prototype.findById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.accessor.findById(id)];
            });
        });
    };
    /**
     *
     */
    Entity.prototype.findByIds = function (ids) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.accessor.findByIds(ids)];
            });
        });
    };
    /**
     *
     */
    Entity.prototype.findAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.accessor.findByFilter({})];
            });
        });
    };
    /**
     *
     */
    Entity.prototype.findByAttribute = function (attrValue) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.accessor.findByAttribute(attrValue)];
            });
        });
    };
    /**
     *
     */
    Entity.prototype.findOneByAttribute = function (attrValue) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = lodash_1.default).first;
                        return [4 /*yield*/, this.accessor.findByAttribute(attrValue)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    /**
     *
     */
    Entity.prototype.getThisOrAllNestedEntities = function () {
        if (lodash_1.default.isEmpty(this.entities))
            return [this];
        return lodash_1.default.flatten(lodash_1.default.map(this.entities, function (entity) { return entity.getThisOrAllNestedEntities(); }));
    };
    return Entity;
}());
exports.Entity = Entity;
