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
exports.MetaDataBuilder = void 0;
var graphql_1 = require("graphql");
var lodash_1 = __importDefault(require("lodash"));
var schema_builder_1 = require("./schema-builder");
var MetaDataBuilder = /** @class */ (function (_super) {
    __extends(MetaDataBuilder, _super);
    function MetaDataBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MetaDataBuilder.prototype.name = function () { return 'MetaData'; };
    MetaDataBuilder.prototype.build = function () {
        var _this = this;
        var fieldMetaData = new graphql_1.GraphQLObjectType({
            name: 'fieldMetaData',
            fields: {
                name: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                type: { type: graphql_1.GraphQLString },
                required: { type: graphql_1.GraphQLBoolean },
                unique: { type: graphql_1.GraphQLString },
                calculated: { type: graphql_1.GraphQLBoolean },
                filter: { type: graphql_1.GraphQLString },
                mediaType: { type: graphql_1.GraphQLString }
            }
        });
        var assocMetaData = new graphql_1.GraphQLObjectType({
            name: 'assocMetaData',
            fields: {
                path: { type: graphql_1.GraphQLString },
                query: { type: graphql_1.GraphQLString },
                required: { type: graphql_1.GraphQLBoolean },
                typesQuery: { type: graphql_1.GraphQLString },
                foreignKey: { type: graphql_1.GraphQLString },
                scope: { type: graphql_1.GraphQLString }
            }
        });
        var entityMetaData = new graphql_1.GraphQLObjectType({
            name: 'entityMetaData',
            fields: function () { return ({
                path: { type: graphql_1.GraphQLString },
                typeQuery: { type: graphql_1.GraphQLString },
                typesQuery: { type: graphql_1.GraphQLString },
                deleteMutation: { type: graphql_1.GraphQLString },
                updateMutation: { type: graphql_1.GraphQLString },
                updateInput: { type: graphql_1.GraphQLString },
                createMutation: { type: graphql_1.GraphQLString },
                createInput: { type: graphql_1.GraphQLString },
                foreignKey: { type: graphql_1.GraphQLString },
                fields: {
                    type: graphql_1.GraphQLList(fieldMetaData),
                    resolve: function (root) { return _this.resolveFields(root); }
                },
                assocTo: {
                    type: graphql_1.GraphQLList(assocMetaData),
                    resolve: function (root) { return _this.resolveAssocTo(root); }
                },
                assocToMany: {
                    type: graphql_1.GraphQLList(assocMetaData),
                    resolve: function (root) { return _this.resolveAssocToMany(root); }
                },
                assocFrom: {
                    type: graphql_1.GraphQLList(assocMetaData),
                    resolve: function (root) { return _this.resolveAssocFrom(root); }
                },
            }); }
        });
        this.graphx.type('query').extendFields(function () {
            return lodash_1.default.set({}, 'metaData', {
                type: new graphql_1.GraphQLList(entityMetaData),
                args: { path: { type: graphql_1.GraphQLString } },
                resolve: function (root, args, context) { return _this.resolve(root, args, context); }
            });
        });
    };
    MetaDataBuilder.prototype.resolve = function (root, args, context) {
        var path = lodash_1.default.get(args, 'path');
        return path ?
            lodash_1.default.filter(this.runtime.entities, function (entity) { return entity.path === path; }) :
            lodash_1.default.values(this.runtime.entities);
    };
    MetaDataBuilder.prototype.resolveFields = function (root) {
        var entity = root;
        return lodash_1.default.map(entity.attributes, function (attribute, name) { return ({
            name: name,
            type: attribute.graphqlType, required: attribute.required, calculated: lodash_1.default.isFunction(attribute.calculate),
            unique: lodash_1.default.toString(attribute.unique), filter: attribute.filterType, mediaType: attribute.mediaType
        }); });
    };
    MetaDataBuilder.prototype.resolveAssocTo = function (root) {
        var _this = this;
        var entity = root;
        return lodash_1.default.map(entity.assocTo, function (assocTo) {
            var refEntity = _this.runtime.entities[assocTo.type];
            return {
                path: refEntity.path,
                query: refEntity.singular,
                required: assocTo.required,
                typesQuery: refEntity.typesQuery,
                foreignKey: refEntity.foreignKey
            };
        });
    };
    MetaDataBuilder.prototype.resolveAssocToMany = function (root) {
        var _this = this;
        var entity = root;
        return lodash_1.default.map(entity.assocToMany, function (assocToMany) {
            var refEntity = _this.runtime.entities[assocToMany.type];
            var scopeEntity = assocToMany.scope ? _this.runtime.entities[assocToMany.scope] : undefined;
            return {
                path: refEntity.path,
                query: refEntity.plural,
                required: assocToMany.required,
                typesQuery: refEntity.typesQuery,
                foreignKey: refEntity.foreignKeys,
                scope: lodash_1.default.get(scopeEntity, 'path')
            };
        });
    };
    MetaDataBuilder.prototype.resolveAssocFrom = function (root) {
        var _this = this;
        var entity = root;
        return lodash_1.default.map(entity.assocFrom, function (assocFrom) {
            var refEntity = _this.runtime.entities[assocFrom.type];
            return {
                path: refEntity.path,
                query: refEntity.plural,
                typesQuery: refEntity.typesQuery,
                foreignKey: entity.foreignKey
            };
        });
    };
    return MetaDataBuilder;
}(schema_builder_1.SchemaBuilder));
exports.MetaDataBuilder = MetaDataBuilder;
