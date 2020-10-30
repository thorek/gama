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
exports.MutationConfigBuilder = exports.MutationBuilder = void 0;
var lodash_1 = __importDefault(require("lodash"));
var schema_builder_1 = require("./schema-builder");
var MutationBuilder = /** @class */ (function (_super) {
    __extends(MutationBuilder, _super);
    function MutationBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MutationBuilder.prototype.build = function () {
        var _this = this;
        this.graphx.type('mutation').extendFields(function () {
            return lodash_1.default.set({}, _this.name(), _this.mutation());
        });
    };
    return MutationBuilder;
}(schema_builder_1.SchemaBuilder));
exports.MutationBuilder = MutationBuilder;
var MutationConfigBuilder = /** @class */ (function (_super) {
    __extends(MutationConfigBuilder, _super);
    function MutationConfigBuilder(_name, config) {
        var _this = _super.call(this) || this;
        _this._name = _name;
        _this.config = config;
        return _this;
    }
    MutationConfigBuilder.create = function (name, config) {
        return new MutationConfigBuilder(name, config);
    };
    MutationConfigBuilder.prototype.name = function () { return this._name; };
    MutationConfigBuilder.prototype.mutation = function () { return this.config(this.runtime); };
    return MutationConfigBuilder;
}(MutationBuilder));
exports.MutationConfigBuilder = MutationConfigBuilder;
