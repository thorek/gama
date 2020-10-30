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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigEntity = void 0;
var lodash_1 = __importDefault(require("lodash"));
var entity_1 = require("./entity");
var ConfigEntity = /** @class */ (function (_super) {
    __extends(ConfigEntity, _super);
    function ConfigEntity(_name, entityConfig) {
        var _this = _super.call(this) || this;
        _this._name = _name;
        _this.entityConfig = entityConfig;
        _this._attributes = undefined;
        return _this;
    }
    ConfigEntity.create = function (name, entityConfig) {
        if (!entityConfig)
            entityConfig = {};
        return new ConfigEntity(name, entityConfig);
    };
    ConfigEntity.prototype.extendEntity = function () { return this.entityConfig.extendEntity; };
    ConfigEntity.prototype.getName = function () { return this._name; };
    ConfigEntity.prototype.getTypeName = function () { return this.entityConfig.typeName || _super.prototype.getTypeName.call(this); };
    ConfigEntity.prototype.getAttributes = function () {
        var _this = this;
        if (!this.entityConfig.attributes)
            return _super.prototype.getAttributes.call(this);
        if (!this._attributes) {
            var attributes = lodash_1.default.mapValues(this.entityConfig.attributes, function (attrConfig, name) { return _this.buildAttribute(name, attrConfig); });
            this._attributes = lodash_1.default.pickBy(attributes, lodash_1.default.identity);
        }
        return this._attributes;
    };
    ConfigEntity.prototype.getAssocTo = function () {
        if (!this.entityConfig.assocTo)
            return _super.prototype.getAssocTo.call(this);
        if (!lodash_1.default.isArray(this.entityConfig.assocTo))
            this.entityConfig.assocTo = [this.entityConfig.assocTo];
        return lodash_1.default.map(this.entityConfig.assocTo, function (assocTo) {
            if (lodash_1.default.isString(assocTo))
                assocTo = { type: assocTo };
            if (lodash_1.default.endsWith(assocTo.type, '!')) {
                assocTo.type = assocTo.type.slice(0, -1);
                assocTo.required = true;
            }
            return assocTo;
        });
    };
    ConfigEntity.prototype.getAssocToMany = function () {
        if (!this.entityConfig.assocToMany)
            return _super.prototype.getAssocToMany.call(this);
        if (!lodash_1.default.isArray(this.entityConfig.assocToMany))
            this.entityConfig.assocToMany = [this.entityConfig.assocToMany];
        return lodash_1.default.map(this.entityConfig.assocToMany, function (bt) {
            return lodash_1.default.isString(bt) ? { type: bt } : bt;
        });
    };
    ConfigEntity.prototype.getAssocFrom = function () {
        if (!this.entityConfig.assocFrom)
            return _super.prototype.getAssocFrom.call(this);
        if (!lodash_1.default.isArray(this.entityConfig.assocFrom))
            this.entityConfig.assocFrom = [this.entityConfig.assocFrom];
        if (!lodash_1.default.isArray(this.entityConfig.assocFrom)) {
            console.warn("'" + this.name + "' assocFrom must be an array but is: ", this.entityConfig.assocFrom);
            return _super.prototype.getAssocFrom.call(this);
        }
        return lodash_1.default.map(this.entityConfig.assocFrom, function (hm) {
            return lodash_1.default.isString(hm) ? { type: hm } : hm;
        });
    };
    ConfigEntity.prototype.getPlural = function () { return this.entityConfig.plural || _super.prototype.getPlural.call(this); };
    ConfigEntity.prototype.getSingular = function () { return this.entityConfig.singular || _super.prototype.getSingular.call(this); };
    ConfigEntity.prototype.getCollection = function () { return this.entityConfig.collection || _super.prototype.getCollection.call(this); };
    ConfigEntity.prototype.getSeeds = function () { return this.entityConfig.seeds || _super.prototype.getSeeds.call(this); };
    ConfigEntity.prototype.getPermissions = function () { return this.entityConfig.permissions || _super.prototype.getPermissions.call(this); };
    ConfigEntity.prototype.getDescription = function () { return this.entityConfig.description || _super.prototype.getDescription.call(this); };
    ConfigEntity.prototype.getEntites = function () {
        var _this = this;
        if (this.isInterface)
            return lodash_1.default.filter(this.runtime.entities, function (entity) { return entity.implementsEntityInterface(_this); });
        return lodash_1.default.compact(lodash_1.default.map(this.entityConfig.union, function (entity) { return _this.runtime.entities[entity]; }));
    };
    ConfigEntity.prototype.getImplements = function () {
        var _this = this;
        if (!this.entityConfig.implements)
            return _super.prototype.getImplements.call(this);
        if (!lodash_1.default.isArray(this.entityConfig.implements))
            this.entityConfig.implements = [this.entityConfig.implements];
        return lodash_1.default.compact(lodash_1.default.map(this.entityConfig.implements, function (entity) { return _this.runtime.entities[entity]; }));
    };
    ConfigEntity.prototype.getIsInterface = function () { return this.entityConfig.interface === true; };
    ConfigEntity.prototype.getAssign = function () { return this.entityConfig.assign; };
    ConfigEntity.prototype.buildAttribute = function (name, attrConfig) {
        attrConfig = this.resolveShortcut(attrConfig);
        this.resolveKey(attrConfig);
        this.resolveScopedKey(attrConfig);
        this.resolveExclamationMark(attrConfig);
        this.resolveFilterType(attrConfig);
        this.warnVirtual(name, attrConfig);
        this.resolveMediaType(attrConfig);
        return {
            graphqlType: attrConfig.type || 'string',
            filterType: attrConfig.filterType,
            validation: attrConfig.validation,
            unique: attrConfig.unique,
            required: attrConfig.required,
            description: attrConfig.description,
            // input: attrConfig.input,
            defaultValue: attrConfig.default,
            mediaType: attrConfig.mediaType,
            calculate: attrConfig.calculate
        };
    };
    ConfigEntity.prototype.resolveShortcut = function (attrConfig) {
        if (lodash_1.default.isString(attrConfig))
            attrConfig = { type: attrConfig };
        if (!attrConfig.type)
            attrConfig.type = 'string';
        return attrConfig;
    };
    ConfigEntity.prototype.resolveKey = function (attrConfig) {
        if (lodash_1.default.toLower(attrConfig.type) === 'key') {
            attrConfig.type = 'string';
            attrConfig.required = true;
            attrConfig.unique = true;
        }
    };
    ConfigEntity.prototype.resolveScopedKey = function (attrConfig) {
        if (lodash_1.default.isString(attrConfig.key)) {
            attrConfig.type = 'string';
            attrConfig.required = true;
            attrConfig.unique = attrConfig.key;
        }
    };
    ConfigEntity.prototype.resolveExclamationMark = function (attrConfig) {
        if (!attrConfig.type)
            return;
        if (lodash_1.default.endsWith(attrConfig.type, '!')) {
            attrConfig.type = attrConfig.type.slice(0, -1);
            attrConfig.required = true;
        }
    };
    ConfigEntity.prototype.resolveFilterType = function (attrConfig) {
        if (attrConfig.filterType === true)
            attrConfig.filterType === undefined;
    };
    ConfigEntity.prototype.resolveMediaType = function (attrConfig) {
        switch (attrConfig.type) {
            case 'image':
                attrConfig.type = 'file';
                attrConfig.mediaType = 'image';
                break;
            case 'video':
                attrConfig.type = 'file';
                attrConfig.mediaType = 'video';
                break;
            case 'audio':
                attrConfig.type = 'file';
                attrConfig.mediaType = 'audio';
                break;
        }
    };
    ConfigEntity.prototype.warnVirtual = function (name, attrConfig) {
        if (lodash_1.default.isFunction(attrConfig.calculate)) {
            if (attrConfig.filterType)
                console.warn(this.name, "[" + name + "]", 'filterType makes no sense for attribute that is resolved manually');
        }
    };
    return ConfigEntity;
}(entity_1.Entity));
exports.ConfigEntity = ConfigEntity;
