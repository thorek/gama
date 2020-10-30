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
exports.EntityBuilder = void 0;
// import { GraphQLUpload } from 'apollo-server-express';
var graphql_1 = require("graphql");
var lodash_1 = __importDefault(require("lodash"));
var entity_1 = require("../entities/entity");
var schema_builder_1 = require("./schema-builder");
var scalarTypes = {
    id: graphql_1.GraphQLID,
    string: graphql_1.GraphQLString,
    int: graphql_1.GraphQLInt,
    float: graphql_1.GraphQLFloat,
    boolean: graphql_1.GraphQLBoolean
};
var EntityBuilder = /** @class */ (function (_super) {
    __extends(EntityBuilder, _super);
    /**
     *
     */
    function EntityBuilder(entity) {
        var _this = _super.call(this) || this;
        _this.entity = entity;
        return _this;
    }
    EntityBuilder.prototype.name = function () { return this.entity.name; };
    Object.defineProperty(EntityBuilder.prototype, "resolver", {
        get: function () { return this.entity.resolver; },
        enumerable: false,
        configurable: true
    });
    EntityBuilder.prototype.attributes = function () { return this.entity.attributes; };
    ;
    /**
     *
     */
    EntityBuilder.prototype.init = function (runtime) {
        _super.prototype.init.call(this, runtime);
        this.entity.init(runtime);
    };
    //
    //
    EntityBuilder.prototype.build = function () {
        var _this = this;
        if (this.entity.isUnion)
            return;
        var from = this.entity.isInterface ? graphql_1.GraphQLInterfaceType : graphql_1.GraphQLObjectType;
        var name = this.entity.typeName;
        this.graphx.type(name, {
            from: from, name: name,
            fields: function () {
                var fields = { id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) } };
                return lodash_1.default.merge(fields, _this.getAttributeFields('type'));
            },
            description: this.entity.description
        });
    };
    //
    //
    EntityBuilder.prototype.extendTypes = function () {
        this.createEntityTypesEnum();
        this.createCreateInputType();
        this.createUpdateInputType();
        this.createFilterType();
        this.createSortType();
        this.addInterfaces();
        this.addReferences();
        this.addQueries();
        this.addMutations();
    };
    //
    //
    EntityBuilder.prototype.createUnionType = function () {
        var _this = this;
        if (!this.entity.isUnion)
            return;
        var name = this.entity.typeName;
        this.graphx.type(name, {
            from: graphql_1.GraphQLUnionType,
            name: name,
            types: function () { return lodash_1.default.compact(lodash_1.default.map(_this.getSpecificEntities(_this.entity), function (entity) { return _this.graphx.type(entity.typeName); })); },
            description: this.entity.description
        });
    };
    EntityBuilder.prototype.getSpecificEntities = function (entity) {
        var _this = this;
        if (!entity.isPolymorph)
            return [entity];
        return lodash_1.default.flatten(lodash_1.default.map(entity.entities, function (e) { return _this.getSpecificEntities(e); }));
    };
    //
    //
    EntityBuilder.prototype.createEntityTypesEnum = function () {
        if (!this.entity.isPolymorph)
            return;
        var entities = this.getSpecificEntities(this.entity);
        var values = lodash_1.default.reduce(entities, function (values, entity) {
            return lodash_1.default.set(values, entity.name, { value: entity.name });
        }, {});
        var name = this.entity.typesEnumName;
        this.graphx.type(name, { name: name, values: values, from: graphql_1.GraphQLEnumType });
    };
    //
    //
    EntityBuilder.prototype.addInterfaces = function () {
        var _this = this;
        if (lodash_1.default.isEmpty(this.entity.implements))
            return;
        lodash_1.default.forEach(this.entity.implements, function (entity) {
            _this.addFieldsFromInterface(entity);
            _this.addAssocTo(entity);
            _this.addAssocToMany(entity);
            _this.addAssocFrom(entity);
        });
        lodash_1.default.set(this.graphx.type(this.entity.typeName), 'interfaceTypes', function () { return lodash_1.default.map(_this.entity.implements, function (entity) { return _this.graphx.type(entity.typeName); }); });
    };
    //
    //
    EntityBuilder.prototype.addFieldsFromInterface = function (entity) {
        var _this = this;
        this.graphx.type(this.entity.typeName).extendFields(function () { return _this.getAttributeFields('type', entity); });
        this.graphx.type(this.entity.filterName).extendFields(function () { return _this.getAttributeFields('filter', entity); });
        this.graphx.type(this.entity.createInput).extendFields(function () { return _this.getAttributeFields('createInput', entity); });
        this.graphx.type(this.entity.updateInput).extendFields(function () { return _this.getAttributeFields('updateInput', entity); });
    };
    //
    //
    EntityBuilder.prototype.addReferences = function () {
        this.addAssocTo();
        this.addAssocToMany();
        this.addAssocFrom();
    };
    //
    //
    EntityBuilder.prototype.addMutations = function () {
        this.addSaveMutations();
        this.addDeleteMutation();
    };
    //
    //
    EntityBuilder.prototype.addQueries = function () {
        if (!this.entity.isPolymorph)
            this.addTypeQuery();
        this.addTypesQuery();
    };
    //
    //
    EntityBuilder.prototype.addAssocTo = function (entity) {
        var _this = this;
        if (!entity)
            entity = this.entity;
        var assocTo = lodash_1.default.filter(entity.assocTo, function (bt) { return _this.checkReference('assocTo', bt); });
        this.graphx.type(this.entity.typeName).extendFields(function () { return lodash_1.default.reduce(assocTo, function (fields, ref) { return _this.addAssocToReferenceToType(fields, ref); }, {}); });
        this.graphx.type(this.entity.createInput).extendFields(function () { return lodash_1.default.reduce(assocTo, function (fields, ref) { return _this.addAssocToForeignKeyToInput(fields, ref); }, {}); });
        this.graphx.type(this.entity.createInput).extendFields(function () { return lodash_1.default.reduce(assocTo, function (fields, ref) { return _this.addAssocToInputToInput(fields, ref); }, {}); });
        this.graphx.type(this.entity.updateInput).extendFields(function () { return lodash_1.default.reduce(assocTo, function (fields, ref) { return _this.addAssocToForeignKeyToInput(fields, ref); }, {}); });
        this.graphx.type(this.entity.filterName).extendFields(// re-use input for filter intentionally
        function () { return lodash_1.default.reduce(assocTo, function (fields, ref) { return _this.addAssocToForeignKeyToInput(fields, ref); }, {}); });
    };
    //
    //
    EntityBuilder.prototype.addAssocToMany = function (entity) {
        var _this = this;
        if (!entity)
            entity = this.entity;
        var assocToMany = lodash_1.default.filter(entity.assocToMany, function (bt) { return _this.checkReference('assocTo', bt); });
        this.graphx.type(this.entity.typeName).extendFields(function () { return lodash_1.default.reduce(assocToMany, function (fields, ref) { return _this.addAssocToManyReferenceToType(fields, ref); }, {}); });
        this.graphx.type(this.entity.createInput).extendFields(function () { return lodash_1.default.reduce(assocToMany, function (fields, ref) { return _this.addAssocToManyForeignKeysToInput(fields, ref); }, {}); });
        this.graphx.type(this.entity.updateInput).extendFields(function () { return lodash_1.default.reduce(assocToMany, function (fields, ref) { return _this.addAssocToManyForeignKeysToInput(fields, ref); }, {}); });
        this.graphx.type(this.entity.filterName).extendFields(// re-use input for filter intentionally
        function () { return lodash_1.default.reduce(assocToMany, function (fields, ref) { return _this.addAssocToManyForeignKeysToInput(fields, ref); }, {}); });
    };
    //
    //
    EntityBuilder.prototype.addAssocToForeignKeyToInput = function (fields, ref) {
        var refEntity = this.runtime.entities[ref.type];
        lodash_1.default.set(fields, refEntity.foreignKey, { type: graphql_1.GraphQLID });
        if (refEntity.isPolymorph)
            lodash_1.default.set(fields, refEntity.typeField, { type: this.graphx.type(refEntity.typesEnumName) });
        return fields;
    };
    //
    //
    EntityBuilder.prototype.addAssocToInputToInput = function (fields, ref) {
        if (ref.input) {
            var refEntity = this.runtime.entities[ref.type];
            lodash_1.default.set(fields, refEntity.typeQuery, { type: this.graphx.type(refEntity.createInput) });
        }
        return fields;
    };
    //
    //
    EntityBuilder.prototype.addAssocToManyForeignKeysToInput = function (fields, ref) {
        var refEntity = this.runtime.entities[ref.type];
        return lodash_1.default.set(fields, refEntity.foreignKeys, { type: graphql_1.GraphQLList(graphql_1.GraphQLID) });
    };
    //
    //
    EntityBuilder.prototype.addAssocToReferenceToType = function (fields, ref) {
        var _this = this;
        var refEntity = this.runtime.entities[ref.type];
        var refObjectType = this.graphx.type(refEntity.typeName);
        return lodash_1.default.set(fields, refEntity.typeQuery, {
            type: refObjectType,
            resolve: function (root, args, context) {
                return _this.resolver.resolveAssocToType(refEntity, { root: root, args: args, context: context });
            }
        });
    };
    //
    //
    EntityBuilder.prototype.addAssocToManyReferenceToType = function (fields, ref) {
        var _this = this;
        var refEntity = this.runtime.entities[ref.type];
        var refObjectType = this.graphx.type(refEntity.typeName);
        return lodash_1.default.set(fields, refEntity.plural, {
            type: new graphql_1.GraphQLList(refObjectType),
            resolve: function (root, args, context) {
                return _this.resolver.resolveAssocToManyTypes(refEntity, { root: root, args: args, context: context });
            }
        });
    };
    //
    //
    EntityBuilder.prototype.addAssocFrom = function (entity) {
        var _this = this;
        if (!entity)
            entity = this.entity;
        var assocFrom = lodash_1.default.filter(entity.assocFrom, function (assocFrom) { return _this.checkReference('assocFrom', assocFrom); });
        this.graphx.type(this.entity.typeName).extendFields(function () { return lodash_1.default.reduce(assocFrom, function (fields, ref) { return _this.addAssocFromReferenceToType(fields, ref); }, {}); });
    };
    //
    //
    EntityBuilder.prototype.addAssocFromReferenceToType = function (fields, ref) {
        var _this = this;
        var refEntity = this.runtime.entities[ref.type];
        var refObjectType = this.graphx.type(refEntity.typeName);
        return lodash_1.default.set(fields, refEntity.plural, {
            type: new graphql_1.GraphQLList(refObjectType),
            resolve: function (root, args, context) {
                return _this.resolver.resolveAssocFromTypes(refEntity, { root: root, args: args, context: context });
            }
        });
    };
    //
    //
    EntityBuilder.prototype.checkReference = function (direction, ref) {
        var refEntity = this.runtime.entities[ref.type];
        if (!(refEntity instanceof entity_1.Entity)) {
            console.warn("'" + this.entity.typeName + ":" + direction + "': no such entity type '" + ref.type + "'");
            return false;
        }
        if (!this.graphx.type(refEntity.typeName)) {
            console.warn("'" + this.entity.typeName + ":" + direction + "': no objectType in '" + ref.type + "'");
            return false;
        }
        return true;
    };
    /**
     *
     */
    EntityBuilder.prototype.createCreateInputType = function () {
        var _this = this;
        var name = this.entity.createInput;
        this.graphx.type(name, { name: name, from: graphql_1.GraphQLInputObjectType, fields: function () {
                var fields = _this.getAttributeFields('createInput');
                // the following is to prevent strange effects with a type definition w/o fields, which could happen under
                // some error cases, but we dont want the schema creation to fails
                if (lodash_1.default.isEmpty(fields))
                    fields = { _generated: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) } };
                return fields;
            } });
    };
    /**
     *
     */
    EntityBuilder.prototype.createUpdateInputType = function () {
        var _this = this;
        var name = this.entity.updateInput;
        this.graphx.type(name, { name: name, from: graphql_1.GraphQLInputObjectType, fields: function () {
                var fields = { id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) } };
                return lodash_1.default.merge(fields, _this.getAttributeFields('updateInput'));
            } });
    };
    /**
     *
     */
    EntityBuilder.prototype.getAttributeFields = function (purpose, entity) {
        var _this = this;
        var attributes = entity ? entity.attributes : this.attributes();
        var fields = lodash_1.default.mapValues(attributes, function (attribute, name) { return _this.getFieldConfig(name, attribute, purpose); });
        if (lodash_1.default.includes(['type', 'filter'], purpose))
            this.addTimestampFields(fields, purpose);
        return lodash_1.default.pickBy(fields, lodash_1.default.identity);
    };
    //
    //
    EntityBuilder.prototype.addTimestampFields = function (fields, purpose) {
        lodash_1.default.set(fields, 'createdAt', this.getFieldConfig('createdAt', { graphqlType: 'string' }, purpose));
        lodash_1.default.set(fields, 'updatedAt', this.getFieldConfig('updatedAt', { graphqlType: 'string' }, purpose));
    };
    //
    //
    EntityBuilder.prototype.getFieldConfig = function (name, attribute, purpose) {
        if (lodash_1.default.includes(['createInput', 'updateInput'], purpose) && this.entity.isFileAttribute(attribute))
            return;
        var addNonNull = this.addNonNull(name, attribute, purpose);
        var fieldConfig = {
            type: this.getGraphQLType(attribute, addNonNull, purpose),
            description: attribute.description
        };
        if (this.skipCalculatedAttribute(name, attribute, purpose, fieldConfig))
            return;
        return fieldConfig;
    };
    //
    //
    EntityBuilder.prototype.addNonNull = function (name, attribute, purpose) {
        if (!attribute.required || lodash_1.default.includes(['filter', 'updateInput'], purpose))
            return false;
        if (attribute.required === true)
            return lodash_1.default.includes(['createInput', 'type'], purpose);
        if (attribute.required === 'create')
            return lodash_1.default.includes(['createInput', 'type'], purpose);
        if (attribute.required === 'update')
            return false;
        throw "unallowed required attribute for '" + this.entity.name + ":" + name + "'";
    };
    //
    //
    EntityBuilder.prototype.skipCalculatedAttribute = function (name, attribute, purpose, fieldConfig) {
        if (!lodash_1.default.isFunction(attribute.calculate))
            return false;
        if (purpose !== 'type')
            return true;
        fieldConfig.resolve = attribute.calculate;
        return false;
    };
    /**
     *
     */
    EntityBuilder.prototype.createFilterType = function () {
        var _this = this;
        var name = this.entity.filterName;
        this.graphx.type(name, { name: name, from: graphql_1.GraphQLInputObjectType, fields: function () {
                var fields = { id: { type: graphql_1.GraphQLID } };
                lodash_1.default.forEach(_this.attributes(), function (attribute, name) {
                    if (lodash_1.default.isFunction(attribute.calculate))
                        return;
                    var filterType = _this.getFilterType(attribute);
                    if (filterType)
                        lodash_1.default.set(fields, name, { type: filterType });
                });
                return fields;
            } });
    };
    /**
     *
     */
    EntityBuilder.prototype.createSortType = function () {
        var name = this.entity.sorterEnumName;
        var values = lodash_1.default(this.attributes()).
            map(function (attribute, name) { return lodash_1.default.isFunction(attribute.calculate) ? [] : [name + "_ASC", name + "_DESC"]; }).
            flatten().compact().
            concat(['id_ASC', 'id_DESC']).
            reduce(function (values, item) { return lodash_1.default.set(values, item, { value: item }); }, {});
        this.graphx.type(name, { name: name, values: values, from: graphql_1.GraphQLEnumType });
    };
    /**
     *
     */
    EntityBuilder.prototype.addTypeQuery = function () {
        var _this = this;
        var typeQuery = this.entity.typeQuery;
        if (!typeQuery)
            return;
        this.graphx.type('query').extendFields(function () {
            return lodash_1.default.set({}, typeQuery, {
                type: _this.graphx.type(_this.entity.typeName),
                args: { id: { type: graphql_1.GraphQLID } },
                resolve: function (root, args, context) { return _this.resolver.resolveType({ root: root, args: args, context: context }); }
            });
        });
    };
    /**
     *
     */
    EntityBuilder.prototype.addTypesQuery = function () {
        var _this = this;
        var typesQuery = this.entity.typesQuery;
        if (!typesQuery)
            return;
        this.graphx.type('query').extendFields(function () {
            return lodash_1.default.set({}, typesQuery, {
                type: new graphql_1.GraphQLList(_this.graphx.type(_this.entity.typeName)),
                args: {
                    filter: { type: _this.graphx.type(_this.entity.filterName) },
                    sort: { type: _this.graphx.type(_this.entity.sorterEnumName) },
                    paging: { type: _this.graphx.type('EntityPaging') }
                },
                resolve: function (root, args, context) { return _this.resolver.resolveTypes({ root: root, args: args, context: context }); }
            });
        });
    };
    /**
     *
     */
    EntityBuilder.prototype.addSaveMutations = function () {
        var _this = this;
        if (this.entity.isPolymorph)
            return;
        var type = new graphql_1.GraphQLObjectType({ name: this.entity.mutationResultName, fields: function () {
                var fields = { validationViolations: {
                        type: new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(_this.graphx.type('ValidationViolation')))
                    } };
                return lodash_1.default.set(fields, _this.entity.typeQuery, { type: _this.graphx.type(_this.entity.typeName) });
            } });
        this.addCreateMutation(type);
        this.addUpdateMutation(type);
    };
    /**
     *
     */
    EntityBuilder.prototype.addCreateMutation = function (type) {
        var _this = this;
        this.graphx.type('mutation').extendFields(function () {
            var args = lodash_1.default.set({}, _this.entity.typeQuery, { type: _this.graphx.type(_this.entity.createInput) });
            _this.addFilesToSaveMutation(args);
            return lodash_1.default.set({}, _this.entity.createMutation, {
                type: type, args: args, resolve: function (root, args, context) { return _this.resolver.saveType({ root: root, args: args, context: context }); }
            });
        });
    };
    /**
     *
     */
    EntityBuilder.prototype.addUpdateMutation = function (type) {
        var _this = this;
        this.graphx.type('mutation').extendFields(function () {
            var args = lodash_1.default.set({}, _this.entity.typeQuery, { type: _this.graphx.type(_this.entity.updateInput) });
            _this.addFilesToSaveMutation(args);
            return lodash_1.default.set({}, _this.entity.updateMutation, {
                type: type, args: args, resolve: function (root, args, context) { return _this.resolver.saveType({ root: root, args: args, context: context }); }
            });
        });
    };
    /**
     *
     */
    EntityBuilder.prototype.addFilesToSaveMutation = function (args) {
        lodash_1.default.forEach(this.entity.attributes, function (attribute, name) {
            // if( this.entity.isFileAttribute( attribute) ) _.set( args, name, { type: GraphQLUpload } );
        });
    };
    /**
     *
     */
    EntityBuilder.prototype.addDeleteMutation = function () {
        var _this = this;
        this.graphx.type('mutation').extendFields(function () {
            return lodash_1.default.set({}, _this.entity.deleteMutation, {
                type: new graphql_1.GraphQLList(graphql_1.GraphQLString),
                args: { id: { type: graphql_1.GraphQLID } },
                resolve: function (root, args, context) { return _this.resolver.deleteType({ root: root, args: args, context: context }); }
            });
        });
    };
    /**
     *
     */
    EntityBuilder.prototype.getGraphQLType = function (attr, addNonNull, purpose) {
        var type = lodash_1.default.isString(attr.graphqlType) ? this.getTypeForName(attr.graphqlType, purpose) : attr.graphqlType;
        return addNonNull ? new graphql_1.GraphQLNonNull(type) : type;
    };
    /**
     *
     */
    EntityBuilder.prototype.getTypeForName = function (name, purpose) {
        var type = this.getScalarType(name, purpose);
        if (type)
            return type;
        try {
            return this.graphx.type(name);
        }
        catch (error) {
            console.error("no such graphqlType:", name, " - using GraphQLString instead");
        }
        return graphql_1.GraphQLString;
    };
    /**
     *
     */
    EntityBuilder.prototype.getScalarType = function (name, purpose) {
        // if( name === 'file' && _.includes(['createInput', 'updateInput'], purpose) ) return GraphQLUpload as GraphQLScalarType;
        var type = scalarTypes[lodash_1.default.toLower(name)];
        if (type)
            return type;
    };
    /**
     *
     */
    EntityBuilder.prototype.getFilterType = function (attr) {
        if (attr.filterType === false)
            return;
        if (!attr.filterType) {
            var typeName = lodash_1.default.isString(attr.graphqlType) ? attr.graphqlType : lodash_1.default.get(attr.graphqlType, 'name');
            typeName = "" + lodash_1.default.toUpper(typeName.substring(0, 1)) + typeName.substring(1);
            attr.filterType = schema_builder_1.TypeBuilder.getFilterName(typeName);
        }
        if (!lodash_1.default.isString(attr.filterType))
            return attr.filterType;
        try {
            return this.runtime.graphx.type(attr.filterType);
        }
        catch (error) {
            console.error("no such filterType:", attr.filterType, " - skipping filter");
        }
    };
    return EntityBuilder;
}(schema_builder_1.TypeBuilder));
exports.EntityBuilder = EntityBuilder;
