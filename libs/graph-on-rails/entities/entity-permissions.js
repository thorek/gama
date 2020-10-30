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
exports.EntityPermissions = void 0;
var lodash_1 = __importDefault(require("lodash"));
var entity_module_1 = require("./entity-module");
/**
 *  TODO refactor
 *  it was wrong to assume the allowed values and the "default restrictions" could be done simultaneously
 *  permissions should
 *  1. allow / disallow action on entity (role based)
 *  2. add additional "filter" to remove unallowed items - based on the loaded item
 *
 *  Another definition should decide about the "select" of entities
 */
var EntityPermissions = /** @class */ (function (_super) {
    __extends(EntityPermissions, _super);
    function EntityPermissions() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     *
     */
    EntityPermissions.prototype.isAllowed = function (action, roles) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.skipPermissionCheck(roles))
                    return [2 /*return*/, true];
                return [2 /*return*/, lodash_1.default.some(roles, function (role) { return _this.isAllowedForRole(action, role); })];
            });
        });
    };
    /**
     *
     */
    EntityPermissions.prototype.skipPermissionCheck = function (roles) {
        if (!this.isUserAndRolesDefined())
            return true;
        if (!this.entity.permissions)
            return true;
        if (!roles)
            return true;
        return false;
    };
    /**
     *
     */
    EntityPermissions.prototype.isAllowedForRole = function (action, role) {
        var rolePermissions = lodash_1.default.get(this.entity.permissions, role);
        if (lodash_1.default.isUndefined(rolePermissions))
            return false;
        if (lodash_1.default.isBoolean(rolePermissions))
            return rolePermissions;
        var actionPermission = lodash_1.default.get(rolePermissions, action);
        return lodash_1.default.isBoolean(actionPermission) ? actionPermission : true;
    };
    /** ************************************************************************************************************ */
    EntityPermissions.prototype.addPermissionToFilter = function (resolverCtx) {
        return __awaiter(this, void 0, void 0, function () {
            var filter;
            return __generator(this, function (_a) {
                filter = lodash_1.default.get(resolverCtx.args, 'filter', {});
                // _.set( filter, 'id', this.getAssignedIds( resolverCtx ) );
                lodash_1.default.set(resolverCtx.args, 'filter', filter);
                return [2 /*return*/];
            });
        });
    };
    EntityPermissions.prototype.getAssignedIds = function (resolverCtx) {
        return __awaiter(this, void 0, void 0, function () {
            var assocTo;
            var _this = this;
            return __generator(this, function (_a) {
                if (!this.entity.assign)
                    return [2 /*return*/, undefined];
                assocTo = lodash_1.default.find(this.entity.assocTo, function (assocTo) { return assocTo.type === _this.entity.assign; });
                if (assocTo)
                    return [2 /*return*/, this.getAssignedIdsFromAssoc(assocTo, resolverCtx)];
                return [2 /*return*/, this.getAssignedIdsFromUser(resolverCtx)];
            });
        });
    };
    EntityPermissions.prototype.getAssignedIdsFromAssoc = function (assoc, resolverCtx) {
        return __awaiter(this, void 0, void 0, function () {
            var entity, ids, items;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        entity = this.runtime.entities[assoc.type];
                        if (!entity)
                            throw new Error("unknown type '" + assoc.type + "'");
                        return [4 /*yield*/, entity.entityPermissions.getAssignedIds(resolverCtx)];
                    case 1:
                        ids = _a.sent();
                        return [4 /*yield*/, this.entity.accessor.findByAttribute(lodash_1.default.set({}, entity.foreignKey, ids))];
                    case 2:
                        items = _a.sent();
                        return [2 /*return*/, lodash_1.default.map(items, function (item) { return item.id; })];
                }
            });
        });
    };
    EntityPermissions.prototype.getAssignedIdsFromUser = function (resolverCtx) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                if (!this.entity.assign)
                    throw new Error("no assign provided");
                if (!this.runtime.contextUser)
                    throw new Error("no contextUser provided");
                user = lodash_1.default.get(resolverCtx.context, this.runtime.contextUser);
                if (!user)
                    throw new Error("no such contextUser '" + this.runtime.contextUser + "'");
                return [2 /*return*/, lodash_1.default.get(user, this.entity.assign)];
            });
        });
    };
    /**
     * Will return `true`
     *   * if no user/roles definition is present in resolver context
     *   * the entity definition has no permission definition
     *
     * @return array of ids, that are allowed to access or true (everything), false (nothing) is allowed
     */
    EntityPermissions.prototype.getPermittedIds = function (action, resolverCtx) {
        return __awaiter(this, void 0, void 0, function () {
            var user, roles, ids, _i, roles_1, role, roleIds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isUserAndRolesDefined())
                            return [2 /*return*/, true];
                        if (!this.entity.permissions)
                            return [2 /*return*/, true];
                        user = lodash_1.default.get(resolverCtx.context, this.runtime.contextUser);
                        roles = this.getUserRoles(user);
                        ids = [];
                        _i = 0, roles_1 = roles;
                        _a.label = 1;
                    case 1:
                        if (!(_i < roles_1.length)) return [3 /*break*/, 4];
                        role = roles_1[_i];
                        return [4 /*yield*/, this.getPermittedIdsForRole(role, action, resolverCtx)];
                    case 2:
                        roleIds = _a.sent();
                        if (roleIds === true)
                            return [2 /*return*/, true];
                        if (roleIds)
                            ids = lodash_1.default.concat(ids, roleIds);
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, lodash_1.default.uniq(ids)];
                }
            });
        });
    };
    /**
     * @returns true if all items can be accessed, false when none, or the array of ObjectIDs that accessible items must match
     */
    EntityPermissions.prototype.getPermittedIdsForRole = function (role, action, resolverCtx) {
        return __awaiter(this, void 0, void 0, function () {
            var permissions, ids, _i, _a, permission, actionIds;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        permissions = this.getActionPermissionsForRole(role, action);
                        if (lodash_1.default.isBoolean(permissions))
                            return [2 /*return*/, permissions];
                        if (!lodash_1.default.isString(permissions)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getPermittedIdsForRole(permissions, action, resolverCtx)];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        ids = [];
                        _i = 0, _a = permissions;
                        _b.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        permission = _a[_i];
                        return [4 /*yield*/, this.getIdsForActionPermission(role, permission, resolverCtx)];
                    case 4:
                        actionIds = _b.sent();
                        if (lodash_1.default.isBoolean(actionIds)) {
                            if (actionIds === false)
                                return [2 /*return*/, false];
                        }
                        else
                            ids.push(actionIds);
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/, lodash_1.default.intersection.apply(lodash_1.default, ids)];
                }
            });
        });
    };
    /**
     *  @param permission if this is a string it will be handled as a reference to an action for the role
     *  in this or a assocTo entity. If it is an object it is delegated to the resolver to use to return the
     *  permitted ids
     */
    EntityPermissions.prototype.getIdsForActionPermission = function (role, permission, resolverCtx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!lodash_1.default.isString(permission)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getIdsForReference(role, permission, resolverCtx)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [2 /*return*/, this.resolvePermittedIds(permission, resolverCtx)];
                }
            });
        });
    };
    /**
     *
     */
    EntityPermissions.prototype.resolvePermittedIds = function (permission, resolverCtx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    'return await this.entity.resolver.getPermittedIds( this.entity, permission, resolverCtx );';
                }
                catch (error) {
                    console.error("'" + this.entity.name + "' resolver could not resolve permission", permission, error);
                }
                return [2 /*return*/, false];
            });
        });
    };
    /**
     *
     */
    EntityPermissions.prototype.getIdsForReference = function (role, permissionReference, resolverCtx) {
        return __awaiter(this, void 0, void 0, function () {
            var entityAction, action, entity;
            return __generator(this, function (_a) {
                entityAction = lodash_1.default.split(permissionReference, '.');
                action = lodash_1.default.last(entityAction);
                entity = lodash_1.default.size(entityAction) === 1 ? this.entity : this.getAssocToEntity(lodash_1.default.first(entityAction));
                return [2 /*return*/, entity ? this.resolvePermittedIdsForAssocTo(entity, role, action, resolverCtx) : false];
            });
        });
    };
    /**
     *
     */
    EntityPermissions.prototype.resolvePermittedIdsForAssocTo = function (entity, role, action, resolverCtx) {
        return __awaiter(this, void 0, void 0, function () {
            var ids;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, entity.entityPermissions.getPermittedIdsForRole(role, action, resolverCtx)];
                    case 1:
                        ids = _a.sent();
                        if (lodash_1.default.isBoolean(ids))
                            return [2 /*return*/, ids];
                        try {
                            'return await this.entity.resolver.getPermittedIdsForForeignKeys( this.entity, entity.foreignKey, ids );';
                        }
                        catch (error) {
                            console.error("'" + this.entity.typeName + "' resolver could not resolve permission for foreign keys for", entity.foreignKey, error);
                        }
                        return [2 /*return*/, false];
                }
            });
        });
    };
    /**
     *
     */
    EntityPermissions.prototype.getAssocToEntity = function (entity) {
        var entityIsAssocTo = lodash_1.default.find(this.entity.assocTo, function (refEntity) { return refEntity.type === entity; });
        if (entityIsAssocTo)
            return this.runtime.entities[entity];
        console.warn("'" + entity + "' is not a assocTo of '" + this.entity.name + "'");
        return null;
    };
    /**
     *  everything defined for a role, can depend on the action or can be defined for all actions
     *
     *  @param role a role of the user
     *  @param action either create, read, update, delete
     *  @returns
     *    boolean - all allowed / unallowed
     *
     *    string - another role in this permissions to get the permitted ids
     *
     *    (string|object)[] - string - get permissions from action in this or a assocTo entity for the same role
     *                      - object - create filter for query as described below
     *
     *  ### Filter for query:
     *  ```
     *    attributeA: value
     *  ```
     *  becomes `{ attributeA: { $eq: value } }`
     *
     *  ---
     *
     *  ```
     *    attributeB:
     *      - value1
     *      - value2
     *      - value3
     *  ```
     *  becomes `{ attributeB: { $in [value1, value2, value3] } }`
     *
     *
     *  ### Examples
     *  ```
     *  entity:
     *    Contract:
     *      attributes:
     *        name: string
     *        status: string
     *      assocTo:
     *        - Car
     *      permissions:
     *        admin: true                 # all actions, everything permitted
     *        guest: false                # all actions, nothing permitted
     *        user: admin                 # all actions the same as for role 'admin'
     *        roleA:
     *          all: true                 # all actions, everything permitted, same as roleA: true
     *        roleB:
     *          all: false                # all actions, nothing permitted - same as roleB: false, pointless
     *          read: true                # except reading is allowed
     *        roleC:
     *          read: true                # reading of all items allowed
     *          create: read              # same as read
     *          update: read              # same as read
     *          delete: false             # no items allowed to delete
     *        roleD:
     *          all:
     *            name: 'Example'
     *          delete: roleC
     *        roleE:
     *          all:
     *            - name: 'Example'
     *        roleF:
     *          read:
     *            - name: 'Example'
     *              status: 'open'
     *          all:
     *            - read
     *            - status:
     *              - draft
     *              - open
     *              name: user.assignedContracts  # will be resolved with context
     *        roleG:
     *          all:
     *            name:
     *              - Example1
     *              - Example2
     *            status:
     *              - open
     *              - draft
     *        roleH:
     *          all: Car.read             # same as in Car.permissions.roleD.read (Car must be a assocTo)
     *                                    # permisions in Car could also delegate to another assocTo entity
     *        roleI:
     *          create: false
     *          all:
     *            name: 'Example'         # read, update, delete allowed for all items with { name: { $eq: "Example" } }
     *        roleJ:
     *          all:
     *            - Car.read               # all actions same as defined in Car.read
     *            - name: 'Example'        # and all items with { name: { $eq: "Example" } }
     *        roleK:
     *          all:
     *            - filter: '{ $and: { name: { $eq: "foo", $neq: "bar" }, { status: { $in officialStatus }} }}'
     * ```
     *
     */
    EntityPermissions.prototype.getActionPermissionsForRole = function (role, action) {
        var permissions = lodash_1.default.get(this.entity.permissions, role);
        if (lodash_1.default.isBoolean(permissions) || lodash_1.default.isString(permissions))
            return permissions;
        var actionPermission = lodash_1.default.get(permissions, action);
        if (!actionPermission)
            actionPermission = lodash_1.default.get(permissions, 'all');
        if (!actionPermission)
            return false;
        if (lodash_1.default.isBoolean(actionPermission))
            return actionPermission;
        if (lodash_1.default.isArray(actionPermission))
            return actionPermission;
        if (lodash_1.default.isObject(actionPermission) || lodash_1.default.isString(actionPermission))
            return [actionPermission];
        console.warn("unexpected permission for role '" + role + "', action '" + action + "'", actionPermission);
        return false;
    };
    /**
     *
     */
    EntityPermissions.prototype.isUserAndRolesDefined = function () {
        return this.runtime.contextUser != null && this.runtime.contextRoles != null;
    };
    /**
     *
     */
    EntityPermissions.prototype.getUserRoles = function (user) {
        if (!user)
            throw 'should not happen, no user in context';
        var roles = lodash_1.default.get(user, this.runtime.contextRoles);
        if (!roles)
            throw new Error("User has no role - " + JSON.stringify(user));
        return lodash_1.default.isArray(roles) ? roles : [roles];
    };
    return EntityPermissions;
}(entity_module_1.EntityModule));
exports.EntityPermissions = EntityPermissions;
