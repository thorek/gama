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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeBuilder = exports.SchemaBuilder = void 0;
/**
 * Base class for any custom type that can occur in a GraphQL Schema
 */
var SchemaBuilder = /** @class */ (function () {
    function SchemaBuilder() {
    }
    Object.defineProperty(SchemaBuilder.prototype, "runtime", {
        get: function () { return this._runtime; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SchemaBuilder.prototype, "graphx", {
        get: function () { return this.runtime.graphx; },
        enumerable: false,
        configurable: true
    });
    ;
    SchemaBuilder.prototype.init = function (runtime) { this._runtime = runtime; };
    return SchemaBuilder;
}());
exports.SchemaBuilder = SchemaBuilder;
/**
 * Base class for any custom type that can occur in a GraphQL Schema
 */
var TypeBuilder = /** @class */ (function (_super) {
    __extends(TypeBuilder, _super);
    function TypeBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    //
    //
    TypeBuilder.getFilterName = function (type) { return type + "Filter"; };
    TypeBuilder.prototype.attributes = function () { return {}; };
    //
    //
    TypeBuilder.prototype.attribute = function (name) {
        return this.attributes()[name];
    };
    return TypeBuilder;
}(SchemaBuilder));
exports.TypeBuilder = TypeBuilder;
