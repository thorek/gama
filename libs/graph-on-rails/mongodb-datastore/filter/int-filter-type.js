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
exports.IntFilterType = void 0;
var graphql_1 = require("graphql");
var lodash_1 = __importDefault(require("lodash"));
var filter_type_1 = require("../../builder/filter-type");
/**
 *
 */
var IntFilterType = /** @class */ (function (_super) {
    __extends(IntFilterType, _super);
    function IntFilterType() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IntFilterType.prototype.graphqlTypeName = function () { return graphql_1.GraphQLInt.name; };
    IntFilterType.prototype.attributes = function () {
        return {
            eq: { graphqlType: graphql_1.GraphQLInt, description: 'equal' },
            ne: { graphqlType: graphql_1.GraphQLInt, description: 'not equal' },
            le: { graphqlType: graphql_1.GraphQLInt, description: 'lower or equal than' },
            lt: { graphqlType: graphql_1.GraphQLInt, description: 'lower than' },
            ge: { graphqlType: graphql_1.GraphQLInt, description: 'greater or equal than' },
            gt: { graphqlType: graphql_1.GraphQLInt, description: 'greater than' },
            isIn: { graphqlType: new graphql_1.GraphQLList(graphql_1.GraphQLInt), description: 'is in list of numbers' },
            notIn: { graphqlType: new graphql_1.GraphQLList(graphql_1.GraphQLInt), description: 'is not in list of numbers' },
            between: {
                graphqlType: new graphql_1.GraphQLList(graphql_1.GraphQLInt),
                description: 'is greater or equal than the first and lower then the last number of a list'
            },
        };
    };
    IntFilterType.prototype.getFilterExpression = function (condition, field) {
        var operator = lodash_1.default.toString(lodash_1.default.first(lodash_1.default.keys(condition)));
        var operand = condition[operator];
        switch (operator) {
            case 'eq': return { $eq: operand };
            case 'ne': return { $ne: operand };
            case 'le': return { $lte: operand };
            case 'lt': return { $lt: operand };
            case 'ge': return { $gte: operand };
            case 'gt': return { $gt: operand };
            case 'isIn': return { $in: operand };
            case 'notIn': return { $nin: operand };
            case 'between': return { $gte: lodash_1.default.first(operand), $lt: lodash_1.default.last(operand) };
        }
        console.warn("IntFilter unknown operator '" + operator + "' ");
    };
    return IntFilterType;
}(filter_type_1.FilterType));
exports.IntFilterType = IntFilterType;
