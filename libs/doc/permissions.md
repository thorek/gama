# Permissions

Permissions are based on two dimensions - the CRUD action a principal (actually a role) can execute on an Entity (what) and the concept of assigned entities or IDs (on which data).

## Principal 

GAMA expects an object of type `PrincipalType` in the resolver context. 

```typescript
export type PrincipalType = {
  roles?:PrincipalRolesType|PrincipalRolesTypeFn
}

export type PrincipalRolesType = undefined|boolean|string|string[]
export type PrincipalRolesTypeFn = ( runtime:Runtime, resolverContext:ResolverContext ) => PrincipalRolesType
```

Possible values of the `roles` property - you can provide that as literals or as a function that is evluated everytime a permission determined. 

|   |   |
| - | - |
| `undefined` | same as no `principal` at all - any default mutation of any entity with a `roles` definition would be prohibited |
| `false`     | same as `undefined` | 
| `true`      | "superuser" - any query & mutation of any entity would be allowed - regardless of assigned IDs |
| string      | any query & mutation of any entity that requires this role would be allowed - if assigned ids match |
| string[]    | any query & mutation of any entity that requires any of this roles would be allowed - if assigned ids match |

<br/>

---

## Roles Definition

You can configure the required role(s) for any of the CRUD (create, read, upate, delete) actions for any entity. 

|   |   |
| - | - |
| CREATE  | `createEntity` mutation     | 
| READ    | `type` and `types` query    |
| UPDATE  | `updateEntity` mutation     |
| DELETE  | `deleteEntity` mutation     |  

<br/>


```typescript
export type EntityConfig  = {
  // rest left out
  roles?:string|RolesType
}

export type RolesType = {
  [role:string]:PermissionRights|PermissionRightsFn|ActionPermissionRights
}

export type ActionPermissionRights = {
  [actions:string]: PermissionRights|PermissionRightsFn
}
export type PermissionRights = boolean|string[]
export type PermissionRightsFn = (resolverCtx:ResolverContext, runtime:Runtime) => PermissionRights
```

### Examples

Keep in mind every action is always allowed without any further evaluation if

  * no `permissions` configuration exists at the entity **or**
  * the `principal` is a "superuser" - `principal.roles` is `true`

Every action is always prohibited without any further evaluation if 
  * a `permissions` configuration exists at the entity **and**
  * there is no `principal` present or a principal with `principal.roles` is `false`

<br>

```yaml
entity: 
  Car: 
    attributes: 
      brand: String
      mileage: Int
    permissions: 
      manager: true    # all actions allowed if principal has role 'manager' 
```

```yaml
entity: 
  Car: 
    attributes: 
      brand: String
      mileage: Int
    permissions: 
      manager:  
        crud: true     # Same as before, all actions allowed if principal has role 'manager' 
      user: false      # all actions not allowed if principal has role 'user', same as omitting this
```

```yaml
entity: 
  Car: 
    attributes: 
      brand: String
      mileage: Int
    permissions: 
      manager:  
        cru: true     # create, read, update allowed if principal has role 'manager' 
        d: false      # delete not allowed - same as omitting this
      user: 
        r: true       # read allowed if principal has role 'user' , all other actions not allowed
```

```yaml
entity: 
  Accessory: 
    attributes: 
      name: String
      price: Int
    assocTo: Car
    permissions: Car  # take permissions from Car 
```



