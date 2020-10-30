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
exports.QueryConfigBuilder = exports.QueryBuilder = void 0;
var lodash_1 = __importDefault(require("lodash"));
var schema_builder_1 = require("./schema-builder");
var QueryBuilder = /** @class */ (function (_super) {
    __extends(QueryBuilder, _super);
    function QueryBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    QueryBuilder.prototype.build = function () {
        var _this = this;
        this.graphx.type('query').extendFields(function () {
            return lodash_1.default.set({}, _this.name(), _this.query());
        });
    };
    return QueryBuilder;
}(schema_builder_1.SchemaBuilder));
exports.QueryBuilder = QueryBuilder;
var QueryConfigBuilder = /** @class */ (function (_super) {
    __extends(QueryConfigBuilder, _super);
    function QueryConfigBuilder(_name, config) {
        var _this = _super.call(this) || this;
        _this._name = _name;
        _this.config = config;
        return _this;
    }
    QueryConfigBuilder.create = function (name, config) {
        return new QueryConfigBuilder(name, config);
    };
    QueryConfigBuilder.prototype.name = function () { return this._name; };
    QueryConfigBuilder.prototype.query = function () { return this.config.query(this.runtime); };
    return QueryConfigBuilder;
}(QueryBuilder));
exports.QueryConfigBuilder = QueryConfigBuilder;
