"use strict";
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
exports.SimpleLogin = void 0;
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var lodash_1 = __importDefault(require("lodash"));
//
//
var SimpleLogin = /** @class */ (function () {
    function SimpleLogin() {
        var _this = this;
        this.users = {};
        this.getConfiguration = function () { return ({
            entity: {
                User: {
                    attributes: {
                        username: { type: 'string!' },
                        password: { type: 'string!' },
                    },
                    seeds: {
                        admin: {
                            username: 'admin',
                            password: _this.password('admin')
                        },
                        user1: {
                            username: 'user1',
                            password: _this.password('user1')
                        },
                        user2: {
                            username: 'user2',
                            password: _this.password('user2')
                        },
                        user3: {
                            username: 'user3',
                            password: _this.password('user3')
                        }
                    }
                }
            },
            mutation: {
                login: function (runtime) { return ({
                    type: 'string',
                    args: {
                        username: { type: 'string!' },
                        password: { type: 'string!' }
                    },
                    resolve: function (root, args) { return _this.login(runtime, args.username, args.password); }
                }); }
            }
        }); };
        this.getUser = function (token) { return token ? _this.users[token] : undefined; };
        this.login = function (runtime, username, password) { return __awaiter(_this, void 0, void 0, function () {
            var entity, user, token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        entity = runtime.entities['User'];
                        if (!entity)
                            return [2 /*return*/, runtime.warn("no 'User' type found", undefined)];
                        return [4 /*yield*/, entity.findOneByAttribute({ username: username })];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            return [2 /*return*/, undefined];
                        return [4 /*yield*/, bcryptjs_1.default.compare(password, user.item.password)];
                    case 2:
                        if (!(_a.sent()))
                            return [2 /*return*/, undefined];
                        token = this.password(lodash_1.default.toString(lodash_1.default.random(99999999999)));
                        this.setUser(token, user.item);
                        return [2 /*return*/, token];
                }
            });
        }); };
        this.setUser = function (token, user) {
            var key = lodash_1.default.findKey(_this.users, function (value) { return value.id === user.id; });
            if (key)
                lodash_1.default.unset(_this.users, key);
            lodash_1.default.set(_this.users, token, user);
        };
        this.password = function (password) {
            var salt = bcryptjs_1.default.genSaltSync(10);
            var hash = bcryptjs_1.default.hashSync(password, salt);
            return hash;
        };
    }
    SimpleLogin.addToDefinition = function (domainDefinition, config) {
        var login = new SimpleLogin();
        domainDefinition.add(login.getConfiguration());
        config.context = function (context) {
            var token = context.req.headers.authorization;
            return { user: login.getUser(token) };
        };
    };
    return SimpleLogin;
}());
exports.SimpleLogin = SimpleLogin;
