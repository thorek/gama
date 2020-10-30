"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphX = void 0;
var graphql_1 = require("graphql");
var lodash_1 = __importDefault(require("lodash"));
var seeder_1 = require("./seeder");
//
//
var GraphX = /** @class */ (function () {
    function GraphX() {
        var _this = this;
        this.rawTypes = {};
        this.fnFromArray = function (fns) { return function () { return fns.reduce(function (obj, fn) { return Object.assign({}, obj, fn.call()); }, {}); }; };
        /**
         *
         */
        this.generate = function () {
            _this.generateTypes();
            return new graphql_1.GraphQLSchema({
                query: _this.type('query'),
                mutation: _this.type('mutation')
            });
        };
        /**
         *
         */
        this.generateTypes = function () {
            lodash_1.default.forEach(_this.rawTypes, function (item, key) {
                if (item.from === graphql_1.GraphQLUnionType) {
                    _this.rawTypes[key] = new graphql_1.GraphQLUnionType({
                        name: item.name,
                        types: lodash_1.default.map(item.types(), function (type) { return type; }),
                        description: item.description
                    });
                }
                else if (item.from === graphql_1.GraphQLInterfaceType) {
                    _this.rawTypes[key] = new graphql_1.GraphQLInterfaceType({
                        name: item.name,
                        description: item.description,
                        fields: _this.fnFromArray(item.fields)
                    });
                }
                else if (item.from === graphql_1.GraphQLObjectType) {
                    _this.rawTypes[key] = new graphql_1.GraphQLObjectType({
                        name: item.name,
                        description: item.description,
                        fields: _this.fnFromArray(item.fields),
                        interfaces: item.interfaceTypes ? item.interfaceTypes() : []
                    });
                }
                else if (item.from === graphql_1.GraphQLScalarType) {
                    _this.rawTypes[key] = new graphql_1.GraphQLScalarType({
                        name: item.name,
                        description: item.description,
                        serialize: item.serialize,
                        parseValue: item.parseValue,
                        parseLiteral: item.parseLiteral
                    });
                }
                else if (item.from === graphql_1.GraphQLEnumType) {
                    _this.rawTypes[key] = new graphql_1.GraphQLEnumType({
                        name: item.name,
                        values: item.values,
                        description: item.description
                    });
                }
                else {
                    _this.rawTypes[key] = new item.from({
                        name: item.name,
                        description: item.description,
                        args: item.args,
                        fields: _this.fnFromArray(item.fields),
                        values: item.values
                    });
                }
            });
        };
    }
    //
    //
    GraphX.prototype.init = function (runtime) {
        this.createQueryType();
        this.createMutationType(runtime);
        this.createValidationViolationType();
        this.createEntityPagingType();
        this.createFileType();
    };
    /**
     *
     */
    GraphX.prototype.createMutationType = function (runtime) {
        this.createType('mutation', {
            name: 'Mutation',
            fields: function () { return ({
                ping: {
                    type: graphql_1.GraphQLString,
                    args: { some: { type: graphql_1.GraphQLString } },
                    resolve: function (root, args) { return "pong, " + args.some + "!"; }
                },
                seed: {
                    type: graphql_1.GraphQLString,
                    args: { truncate: { type: graphql_1.GraphQLBoolean } },
                    resolve: function (root, args, context) { return seeder_1.Seeder.create(runtime).seed(args.truncate); }
                }
            }); }
        });
    };
    /**
     *
     */
    GraphX.prototype.createQueryType = function () {
        this.createType('query', {
            name: 'Query',
            fields: function () { return ({
                ping: { type: graphql_1.GraphQLString, resolve: function () { return 'pong'; } }
            }); }
        });
    };
    /**
     *
     */
    GraphX.prototype.createValidationViolationType = function () {
        this.type('ValidationViolation', {
            name: 'ValidationViolation',
            fields: function () { return ({
                attribute: { type: graphql_1.GraphQLString },
                message: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) }
            }); }
        });
    };
    /**
     *
     */
    GraphX.prototype.createEntityPagingType = function () {
        this.type('EntityPaging', {
            name: 'EntityPaging',
            description: 'use this to get a certain fraction of a (large) result set',
            from: graphql_1.GraphQLInputObjectType,
            fields: function () { return ({
                page: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLInt), description: 'page of set, starts with 0' },
                size: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt), description: 'number of items in page, 0 means no limit' }
            }); }
        });
    };
    /**
     *
     */
    GraphX.prototype.createFileType = function () {
        this.type('File', {
            name: 'File',
            fields: function () { return ({
                filename: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                mimetype: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                encoding: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString) }
            }); }
        });
    };
    //
    //
    GraphX.prototype.createType = function (name, obj) {
        var _this = this;
        if (this.rawTypes[name])
            throw new Error("Type '" + name + "' already exists.");
        return this.rawTypes[name] = {
            from: obj.from || graphql_1.GraphQLObjectType,
            name: obj.name,
            description: obj.description,
            args: obj.args,
            fields: [obj.fields],
            values: obj.values,
            types: obj.types,
            interfaceTypes: obj.interfaceTypes,
            parseValue: obj.parseValue,
            parseLiteral: obj.parseLiteral,
            serialize: obj.serialize,
            extendFields: function (fields) { return _this.rawTypes[name].fields.push(fields instanceof Function ? fields : function () { return fields; }); },
        };
    };
    //
    //
    GraphX.prototype.type = function (name, obj) {
        if (obj === undefined) {
            if (this.rawTypes[name] === undefined)
                throw new Error("Type '" + name + "' does not exist in this GraphX.");
            return this.rawTypes[name];
        }
        return this.createType(name, obj);
    };
    return GraphX;
}());
exports.GraphX = GraphX;
