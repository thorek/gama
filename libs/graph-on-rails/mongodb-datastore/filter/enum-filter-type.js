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
exports.EnumFilterType = void 0;
var graphql_1 = require("graphql");
var lodash_1 = __importDefault(require("lodash"));
var filter_type_1 = require("../../builder/filter-type");
//
//
var EnumFilterType = /** @class */ (function (_super) {
    __extends(EnumFilterType, _super);
    function EnumFilterType(enumName) {
        var _this = _super.call(this) || this;
        _this.enumName = enumName;
        return _this;
    }
    EnumFilterType.prototype.graphqlTypeName = function () { var _a; return (_a = this.graphx.type(this.enumName)) === null || _a === void 0 ? void 0 : _a.name; };
    EnumFilterType.prototype.attributes = function () {
        var enumType = this.graphx.type(this.enumName);
        return {
            ne: { graphqlType: enumType },
            eq: { graphqlType: enumType },
            in: { graphqlType: new graphql_1.GraphQLList(enumType) },
            notIn: { graphqlType: new graphql_1.GraphQLList(enumType) }
        };
    };
    EnumFilterType.prototype.getFilterExpression = function (condition, field) {
        var enumType = this.graphx.type(this.enumName);
        if (!(enumType instanceof graphql_1.GraphQLEnumType))
            return null;
        var operator = lodash_1.default.toString(lodash_1.default.first(lodash_1.default.keys(condition)));
        var operand = condition[operator];
        switch (operator) {
            case 'eq': return { $eq: operand };
            case 'nw': return { $nw: operand };
            case 'contains': return { $regex: new RegExp(".*" + operand + ".*", 'i') };
            case 'notContains': return { $regex: new RegExp(".*^[" + operand + "].*", 'i') };
            case 'beginsWith': return { $regex: new RegExp(operand + ".*", 'i') };
        }
        console.warn("EnumFilterType '" + this.enumName + "' unknown operator '" + operator + "' ");
    };
    return EnumFilterType;
}(filter_type_1.FilterType));
exports.EnumFilterType = EnumFilterType;
