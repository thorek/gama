# Permissions

All things described here refer to the default `EntityPermssions` implementation. You can replace this with your own implementation - as described in the last section of this document.

Permissions are based on two dimensions - the CRUD action a principal (actually a role) can execute on an Entity (what) and the concept of permssion expressions (on which data).

## Principal 

GAMA expects an object of type `PrincipalType` under the name `principal` in the resolver context. This can be either the `object` or a function returning the principal .

```typescript
export type PrincipalType = {
  roles?:PrincipalRolesType|PrincipalRolesTypeFn
}

export type PrincipalRolesType = undefined|boolean|string|string[]
export type PrincipalRolesTypeFn = 
  (runtime:Runtime, resolverContext:ResolverContext) => PrincipalRolesType


export type context = {
  principal?:PrincipalType | ((rt:Runtime, ctx:ResolverContext) => PrincipalType)
}
```

**No principal**

If no principal can be determined any default mutation of any entity with a `permissions` definition would be prohibited

**Principal roles**

These are possible values of the `roles` property - you can provide it as literals or as a function that is evaluated everytime a permission is determined. 

|   |   |
| - | - |
| `undefined` | same as no `principal` present  |
| `true`      | "superuser" - any query & mutation of any entity is allowed - regardless of assigned filter |
| `false`     | "looser user" - same as `undefined` - no action allowed if permissions are required | 
| string      | any query & mutation of any entity requiring this role is allowed - if assigned filter match |
| string[]    | any query & mutation of any entity requiring any of these roles is allowed - if assigned filter match |

<br/>

---

## Entity Permissions Definition

You can configure the required role(s) for accessing queries and mutations of an entity by requiring certain roles - also differentiated for any of the CRUD (create, read, upate, delete) actions. 

```typescript
export type EntityConfig  = {
  // rest omitted
  permissions?:string|EntityPermissionsType
}
```

**Permissions Values**


|   |   |
| - | - |
| `undefined` | no permission evaluation for this entity, regardless of a `principal` exists or any of its roles  |
| string  | delegate the permissions evaluation to this entity, must be an `assocTo` relationship  |
| EntityPermissionsType | require certain roles to allow qeries and mutation for this entity      |

<br/>

**EntityPermissionsType**

```typescript
export type EntityPermissionsType = {
  [roleName:string]:boolean|RolePermissions
}

export type RolePermissions = PermissionExpression|ActionPermissions
```

Possible values per role are:

|   |   |
| ----------------------- | - |
| `true`   | any query and mutation of this entity is allowed if principal has role `roleName`, any restriction from other roles are not regarded |
| `false`  | same as not adding `roleName` to permissions definition |
| string   | builds a permisson expression from assigned ids of principal to be found under this property  (see below) |
| `()=>any`| allows _any_ query and mutation of this entity if `principal` has role `roleName` and expression matches the required data |
| ActionPermissionRights  | Define permissions for this entity / role per action  |

<br/>

**ActionPermissionRights**

```typescript
export type ActionPermissions = {
  [actions:string]: boolean|PermissionExpression
```

You can specify allowed / prohibited actions in as key in the `ActionPermissionRights` definition.

| Action  | key in actionDefinition  |  Query / Mutation | 
| - | - | - |
| CREATE  | c | `createEntity` mutation | 
| READ    | r | `type` and `types` query     | 
| UPDATE  | u | `updateEntity` mutation      |
| DELETE  | d | `deleteEntity` mutation |

<br/>

You can combine any of this keys; order is irrelevant; if an action key appears more than once any will be evaluated seperately. 

|   |   |
| - | - |
| `crud`  | all actions, same as setting this at role level  |
| `r`     | only read actions |
| `cru`   | any action, except delete |
| `xyz`   | any other letter / key will be ignored |

<br>

_Possible values_ per actions key

|   |   |
| -------- | - |
| `true`   | queries and mutations of this entity for the action(s) are allowed if principal has role `roleName`, any restriction from other roles are not regarded |
| `false`  | same as omitting the actions in permissions definition for the role |
| string   | builds a permisson expression from assigned ids of principal to be found under this property  (see below) |
| `()=>any`| allows the query/mutation for the action(s) of this entity if `principal` has role `roleName` and expression matches the required data |


<br/>

**Permission Expression**

```typescript
export type PermissionExpression = PrincipalAssignedIds|PermissionExpressionFn
export type PermissionExpressionFn = (principal:PrincipalType, resolverCtx:ResolverContext, runtime:Runtime) => any
export type PrincipalAssignedIds = string
```

If you apply the value `true` to either a role or action - it will allow any affected query and mutation to executed without any further limitation.

This is sometimes not fine grained enough - a principal might probably be allowed to read all entity items but may only create or update certain items and should not be allowed to delete any items. 

While - in this example - read would be simply `true` and delete `false` - we must define a way which items a principal might update or create. 

This is done via `PermissionExpression` that a role permission or action permission can provide. Since a principal can have multiple roles, multiple expressions could have an effect to queries and muatations. 

| Action  | Query / Mutation | Effect                                                                       | 
| ------- | ---------------- | ---------------------------------------------------------------------------- |
| CREATE  | createMutation   | allowed if role or action permission resolves to `true` or **any expression**; otherwise throws error  |
| READ    | typesQuery       | add expression to the given filter of the typesQuery; would only return items that match the filter from the request **and any** of the permission expressions |
| READ    | typeQuery        | throws error if `id` does not match any of the items from **any** of the permission expressions |
| UPDATE  | updateMutation   | throws error if `id` does not match any of the items from **any** of the permission expressions |
| DELETE  | deleteMutation   | throws error if `id` does not match any of the items from **any** of the permission expressions |

<br>

The expression can of course use properties of the principal. Let's assume a principal with the role "user" should only be able to read and update cars of certain brands and that the assigned brands is a property of the principal the application sets in the context, e.g. `principal.brands = ['BMW', 'Mercedes']`.

```typescript
{
  entity: {
    'Car': {
      attributes: {
        licence: 'Key',
        brand: 'String!',
        mileage: 'Int'
      },
      permissions: {
        user: {
          ru: (principal) => ({ brand: { $in: principal.brands } }),
          cd: false // same as omitting this 
        }
      }
    }
  }
}
```

You might see that the expression syntax is dependent on the datastore. This is a tiny difference here (since the filter syntax is somehow leaned to the default _datastore_ implementation (MongoDB). But if you would decide to run your domain configuration with another _datastore_ implementation - say MySQL - things would break. 

On one hand this gives you all the freedom and possibilities the underlying _datastore_ technology offers, like complex aggregations, joins, calculations etc. On the other hand is your domain configuration now coupled to a certain _datastore_ implementation. You can avoid this by delegating the creation of the expression to the datastore itself and using the (of course limited) possibilities of the filter definition for this entity. So the example above could've been written with filter syntax like so:

```typescript
permissions: {
  user: {
    ru: (principal:any, ctx:ResolverContext, runtime:Runtime) => 
      runtime.dataStore.buildExpressionFromFilter( 
        runtime.entity('Car'), { brand: { in: principal.brands} } )
    }
  }
}
```

This is now exactly the syntax of the typesQuery filter, therefore decoupled from the actual datastore implementation. A more complex example - that could not be implemented via default filter syntax would be if the user should be allowed to read and update cars of all asigned brands or every other car that has a higher mileage than `100,000`. A filter cannot do that. The MongoDB expression for this requirement would look like this: 

```typescript
permissions: {
  user: {
    ru: (principal) => ({
      $or: [
        {brand: {$in: principal.brands}}, 
        {mileage: {$gt: 100000}}
      ]
    })
  }
}
```

 
## Examples

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



