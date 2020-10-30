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
exports.EnumConfigBuilder = exports.EnumBuilder = void 0;
var graphql_1 = require("graphql");
var lodash_1 = __importDefault(require("lodash"));
var schema_builder_1 = require("./schema-builder");
var EnumBuilder = /** @class */ (function (_super) {
    __extends(EnumBuilder, _super);
    function EnumBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EnumBuilder.prototype.build = function () {
        var name = this.name();
        var values = {};
        lodash_1.default.forEach(this.enum(), function (value, key) { return lodash_1.default.set(values, key, { value: value }); });
        this.graphx.type(name, { name: name, values: values, from: graphql_1.GraphQLEnumType });
    };
    EnumBuilder.prototype.extendTypes = function () {
        this.createEnumFilter();
    };
    EnumBuilder.prototype.createEnumFilter = function () {
        var filterType = this.runtime.dataStore.getEnumFilterType(this.name());
        filterType.init(this.runtime);
        filterType.build();
    };
    return EnumBuilder;
}(schema_builder_1.TypeBuilder));
exports.EnumBuilder = EnumBuilder;
var EnumConfigBuilder = /** @class */ (function (_super) {
    __extends(EnumConfigBuilder, _super);
    function EnumConfigBuilder(_name, config) {
        var _this = _super.call(this) || this;
        _this._name = _name;
        _this.config = config;
        return _this;
    }
    EnumConfigBuilder.create = function (name, enumConfig) {
        return new EnumConfigBuilder(name, enumConfig);
    };
    EnumConfigBuilder.prototype.name = function () { return this._name; };
    EnumConfigBuilder.prototype.enum = function () {
        return lodash_1.default.isArray(this.config) ?
            lodash_1.default.reduce(this.config, function (config, item) { return lodash_1.default.set(config, lodash_1.default.toUpper(item), lodash_1.default.toLower(item)); }, {}) :
            this.config;
    };
    return EnumConfigBuilder;
}(EnumBuilder));
exports.EnumConfigBuilder = EnumConfigBuilder;
