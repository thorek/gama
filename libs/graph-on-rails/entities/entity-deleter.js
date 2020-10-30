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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityDeleter = exports.DeletionError = void 0;
var lodash_1 = __importDefault(require("lodash"));
var entity_module_1 = require("./entity-module");
//
//
var DeletionError = /** @class */ (function (_super) {
    __extends(DeletionError, _super);
    function DeletionError(message) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, _newTarget.prototype); // restore prototype chain
        _this.name = DeletionError.name; // stack traces display correctly now
        return _this;
    }
    return DeletionError;
}(Error));
exports.DeletionError = DeletionError;
//
//
var EntityDeleter = /** @class */ (function (_super) {
    __extends(EntityDeleter, _super);
    function EntityDeleter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EntityDeleter.prototype.deleteAssocFrom = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var item, _i, _a, assocFrom, _b, _c, assocFrom;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.entity.findById(id)];
                    case 1:
                        item = _d.sent();
                        _i = 0, _a = this.entity.assocFrom;
                        _d.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        assocFrom = _a[_i];
                        if (!(assocFrom.delete === 'prevent')) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.preventAssocFrom(item, assocFrom)];
                    case 3:
                        _d.sent();
                        _d.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        _b = 0, _c = this.entity.assocFrom;
                        _d.label = 6;
                    case 6:
                        if (!(_b < _c.length)) return [3 /*break*/, 9];
                        assocFrom = _c[_b];
                        if (!(assocFrom.delete === 'cascade')) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.cascadeAssocFrom(item, assocFrom)];
                    case 7:
                        _d.sent();
                        _d.label = 8;
                    case 8:
                        _b++;
                        return [3 /*break*/, 6];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    EntityDeleter.prototype.cascadeAssocFrom = function (item, assocFrom) {
        return __awaiter(this, void 0, void 0, function () {
            var items, _i, items_1, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, item.assocFrom(assocFrom.type)];
                    case 1:
                        items = _a.sent();
                        _i = 0, items_1 = items;
                        _a.label = 2;
                    case 2:
                        if (!(_i < items_1.length)) return [3 /*break*/, 5];
                        i = items_1[_i];
                        return [4 /*yield*/, i.delete()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    EntityDeleter.prototype.preventAssocFrom = function (item, assocFrom) {
        return __awaiter(this, void 0, void 0, function () {
            var items, size;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, item.assocFrom(assocFrom.type)];
                    case 1:
                        items = _a.sent();
                        size = lodash_1.default.size(items);
                        if (size > 0)
                            throw new DeletionError(item.toString() + " cannot be deleted - " + size + " " + assocFrom.type + " prevent it.");
                        return [2 /*return*/];
                }
            });
        });
    };
    return EntityDeleter;
}(entity_module_1.EntityModule));
exports.EntityDeleter = EntityDeleter;
