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
exports.FilterType = void 0;
var graphql_1 = require("graphql");
var lodash_1 = __importDefault(require("lodash"));
var schema_builder_1 = require("./schema-builder");
/**
 * Base class for all Filter Types
 */
var FilterType = /** @class */ (function (_super) {
    __extends(FilterType, _super);
    function FilterType() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FilterType.prototype.name = function () { return schema_builder_1.TypeBuilder.getFilterName(this.graphqlTypeName()); };
    FilterType.prototype.init = function (runtime) {
        _super.prototype.init.call(this, runtime);
        lodash_1.default.set(runtime.filterTypes, this.name(), this);
    };
    FilterType.prototype.build = function () {
        var _this = this;
        var filterName = this.name();
        this.graphx.type(filterName, {
            name: filterName,
            from: graphql_1.GraphQLInputObjectType,
            fields: function () {
                var fields = {};
                _this.setAttributes(fields);
                return fields;
            }
        });
    };
    FilterType.prototype.setAttributes = function (fields) {
        lodash_1.default.forEach(this.attributes(), function (attribute, name) {
            lodash_1.default.set(fields, name, { type: attribute.graphqlType, description: attribute.description });
        });
    };
    return FilterType;
}(schema_builder_1.TypeBuilder));
exports.FilterType = FilterType;
