"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityModule = void 0;
var EntityModule = /** @class */ (function () {
    function EntityModule(entity) {
        this.entity = entity;
    }
    Object.defineProperty(EntityModule.prototype, "runtime", {
        get: function () { return this.entity.runtime; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EntityModule.prototype, "name", {
        get: function () { return this.entity.name; },
        enumerable: false,
        configurable: true
    });
    EntityModule.prototype.warn = function (message, type) {
        console.warn(message);
        return type;
    };
    return EntityModule;
}());
exports.EntityModule = EntityModule;
