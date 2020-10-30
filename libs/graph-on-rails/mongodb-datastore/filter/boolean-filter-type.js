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
exports.BooleanFilterType = void 0;
var graphql_1 = require("graphql");
var lodash_1 = __importDefault(require("lodash"));
var filter_type_1 = require("../../builder/filter-type");
/**
 *
 */
var BooleanFilterType = /** @class */ (function (_super) {
    __extends(BooleanFilterType, _super);
    function BooleanFilterType() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BooleanFilterType.prototype.graphqlTypeName = function () { return graphql_1.GraphQLBoolean.name; };
    BooleanFilterType.prototype.attributes = function () {
        return {
            is: { graphqlType: graphql_1.GraphQLBoolean, description: 'is' },
            isNot: { graphqlType: graphql_1.GraphQLBoolean, description: 'is not' }
        };
    };
    BooleanFilterType.prototype.getFilterExpression = function (condition, field) {
        var operator = lodash_1.default.toString(lodash_1.default.first(lodash_1.default.keys(condition)));
        var operand = condition[operator];
        switch (operator) {
            case 'is': return { $eq: operand };
            case 'isNot': return { $ne: operand };
        }
        console.warn("BooleanFilter unknown operator '" + operator + "' ");
    };
    return BooleanFilterType;
}(filter_type_1.FilterType));
exports.BooleanFilterType = BooleanFilterType;
