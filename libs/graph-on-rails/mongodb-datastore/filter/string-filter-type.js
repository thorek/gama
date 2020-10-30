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
exports.StringFilterType = void 0;
var graphql_1 = require("graphql");
var lodash_1 = __importDefault(require("lodash"));
var filter_type_1 = require("../../builder/filter-type");
/**
 *
 */
var StringFilterType = /** @class */ (function (_super) {
    __extends(StringFilterType, _super);
    function StringFilterType() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StringFilterType.prototype.graphqlTypeName = function () { return graphql_1.GraphQLString.name; };
    //
    //
    StringFilterType.prototype.attributes = function () {
        return {
            is: { graphqlType: graphql_1.GraphQLString },
            isNot: { graphqlType: graphql_1.GraphQLString },
            in: { graphqlType: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
            notIn: { graphqlType: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
            contains: { graphqlType: graphql_1.GraphQLString },
            doesNotContain: { graphqlType: graphql_1.GraphQLString },
            beginsWith: { graphqlType: graphql_1.GraphQLString },
            endsWith: { graphqlType: graphql_1.GraphQLString },
            caseSensitive: { graphqlType: graphql_1.GraphQLBoolean }
        };
    };
    //
    //
    StringFilterType.prototype.getFilterExpression = function (condition, field) {
        var _this = this;
        var caseSensitive = lodash_1.default.get(condition, 'caseSensitive') === true;
        delete condition.caseSensitive;
        var operations = lodash_1.default.compact(lodash_1.default.map(condition, function (operand, operator) { return _this.getOperation(operator, operand, caseSensitive); }));
        return lodash_1.default.size(operations) > 1 ? { $and: operations } : lodash_1.default.first(operations);
    };
    //
    //
    StringFilterType.prototype.getOperation = function (operator, operand, caseSensitive) {
        var i = caseSensitive ? undefined : 'i';
        switch (operator) {
            case 'is': return { $eq: operand };
            case 'isNot': return { $ne: operand };
            case 'in': return { $in: operand };
            case 'notIn': return { $nin: operand };
            case 'contains': return { $regex: new RegExp(".*" + operand + ".*", i) };
            case 'doesNotContain': return { $regex: new RegExp(".*^[" + operand + "].*", i) };
            case 'beginsWith': return { $regex: new RegExp("^" + operand, i) };
            case 'endsWith': return { $regex: new RegExp(operand + "$", i) };
        }
        console.warn("StringFilterType unknown operator '" + operator + "' ");
    };
    return StringFilterType;
}(filter_type_1.FilterType));
exports.StringFilterType = StringFilterType;
