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
exports.DateFilterType = void 0;
var graphql_1 = require("graphql");
var lodash_1 = __importDefault(require("lodash"));
var filter_type_1 = require("../../builder/filter-type");
/**
 *
 */
var DateFilterType = /** @class */ (function (_super) {
    __extends(DateFilterType, _super);
    function DateFilterType() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DateFilterType.prototype.graphqlTypeName = function () { return 'Date'; };
    DateFilterType.prototype.attributes = function () {
        var dateType = this.graphx.type('Date');
        return {
            eq: { graphqlType: dateType, description: 'equal' },
            ne: { graphqlType: dateType, description: 'not equal' },
            beforeOrEqual: { graphqlType: dateType },
            before: { graphqlType: dateType },
            afterOrEqual: { graphqlType: dateType },
            after: { graphqlType: dateType },
            isIn: { graphqlType: new graphql_1.GraphQLList(dateType), description: 'is in list of dates' },
            notIn: { graphqlType: new graphql_1.GraphQLList(dateType), description: 'is not in list of dates' },
            between: {
                graphqlType: new graphql_1.GraphQLList(dateType),
                description: 'is before or equal to the first and after the last date of the list'
            }
        };
    };
    DateFilterType.prototype.getFilterExpression = function (condition, field) {
        var operator = lodash_1.default.toString(lodash_1.default.first(lodash_1.default.keys(condition)));
        var operand = condition[operator];
        console.log(operand, operand instanceof Date);
        switch (operator) {
            case 'eq': return { $eq: operand };
            case 'ne': return { $ne: operand };
            case 'beforeOrEqual': return { $lte: operand };
            case 'before': return { $lt: operand };
            case 'afterOrEqual': return { $gte: operand };
            case 'after': return { $gt: operand };
            case 'isIn': return { $in: operand };
            case 'notIn': return { $nin: operand };
            case 'between': return { $gte: lodash_1.default.first(operand), $lt: lodash_1.default.last(operand) };
        }
        console.warn("DateFilter unknown operator '" + operator + "' ");
    };
    return DateFilterType;
}(filter_type_1.FilterType));
exports.DateFilterType = DateFilterType;
