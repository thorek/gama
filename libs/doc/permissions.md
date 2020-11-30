# Permissions

Everything described here refers to the default `EntityPermissions` implementation. You could replace this with your own implementation though - as described in [Custom Implementations](./custom-implementations.md).

## Securing your API

Per default your API is public. Anyone with access to the GraphQL endpoint can request any query or mutation. You can of course add restrictions on higher levels, e.g. enabling access via VPN or limit to certain IPs etc. These measures would be out of scope for GAMA. 

On a functional level though GAMA supports three quite common approaches to control the access of an API by a client:

  * access to queries and mutations based on roles and rights 
  * limiting the data a client can read or manage, e.g. based on assigned items (think of seeing only employees of any organisation a certain user is member of but not of other organisation's)
  * API limits - the number of possible API requests a client can make  (not yet)


## Principal 

To evaluate access rights GAMA expects an object of type `PrincipalType` under the name `principal` in the resolver context. This can be either the `object` itself or a function returning the principal object.

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

See how an application can provide a principal here: [GAMA Principal](./gama-principal.md).

<br>

**No principal**

If no principal can be determined any default query and mutation of any entity with a `permissions` definition would be prohibited

<br>

**Principal roles**

These are possible values of the `roles` property - provided it as literals or as a function that is evaluated everytime a permission is determined. 

| Value     | Type | Description  |
| --------- | ---- | ------------ |
| _empty_   | `undefined` | same as no `principal` present  |
| `true`    | boolean     | "superuser" - any query & mutation of any entity is allowed - regardless of assigned filter |
| `false`   | boolean     | "looser user" - same as `undefined` - no action allowed if permissions are required | 
| roleName  | string | any query & mutation of any entity requiring this role is allowed - if assigned filter match |
| roleNames | string[] | any query & mutation of any entity requiring any of these roles is allowed - if assigned filter match |

<br/>

---

## Entity Permissions Definition

You may configure required role(s) for accessing queries and mutations of an entity by adding it to the entity configuration. 

```typescript
export type EntityConfig  = {
  // rest omitted
  permissions?:PermissionDelegate|EntityPermissionsType
}

export type PermissionDelegate = string
```

**Permissions Values**

| Value | Type | Description |  
| ----- | - | - |
| _empty_ | `undefined` | no permission evaluation for this entity, any query and mutation is allowed unlimited, regardless if a `principal` exists or has any roles  |
| [Role Permissions](#role-permissions) | EntityPermissionsType |  require certain roles to allow qeries and mutation for this entity    |
| [Permission Delegate](#permission-delegate) | string  | Entity name, must be an `assocTo` relationship, delegates the permissions evaluation to this entity |

<br/>

### Example

```yaml
entities: 
  Car:
    attributes: 
      licence: Key
```

There will be no permission evaluation for any query or mutation of this entity. Whether a principal is present or what roles the principal has, has no effect. 

<br>

## Role Permissions

```typescript
export type EntityPermissionsType = {
  [role:string]:
    boolean | 
    ActionPermissionType
    PermissionExpressionFn |     
    AssignedEntity 
}

export type AssignedEntity = string
```

Possible values (per role) are:

| Value | Type | Description |  
| ----------------------- | - | - |
| `true` | boolean | any query and mutation of this entity is allowed if principal has role `roleName`, any restriction from other roles are not regarded |
| `false` | boolean | same as not adding `roleName` to permissions definition |
| [Action Permissions](#action-permissions) | ActionPermissionType | differentiate permissions for this entity / role further per action (create, read, update, delete)  |
| [Permission Function(s)](#permission-function) | PermissionExpressionFn | Callback to add expressions to determine the permitted items for the role  |
| [Assigned Entity](#assigned-entity) | string |  name of an entity that is referenced by the principal object to filter permitted items for all actions |

<br/>

### Example 

```yaml
entities: 
  Car:
    attributes: 
      licence: Key
    permissions: 
      manager: true
      assistant: false
```

Any principal with the role "manager" is allowed to access any query and mutation of the entity. The configuration of the role "assistent" is redundant. It could have been omitted. Any principal without the "manager" role (whether it has "assistant" or not) can not access any of the queries or mutations of this entity.

<br>

## Action Permissions

If you want to diffirentiate the allowed action (e.g. a client should be able to read data but not save or delete them) you can specify a permission per action.

```typescript
export type ActionPermissionType = {
  create?: boolean|AssignedEntity
  read?: boolean|AssignedEntity
  update?: boolean|AssignedEntity
  delete?: boolean|AssignedEntity
}
```

| Value | Type | Description |  
| -------- | - | - |
| `true`    | boolean | queries and mutations of this entity for the action(s) are allowed if principal has role `roleName`, any restriction from other roles are not regarded |
| `false`   | boolean | same as omitting the actions permissions definition |
| [Assigned Entity](#assigned-entity) | string |  name of an entity that is referenced by the principal object to filter permitted items for this action |


<br/>

The allowed / prohibited action affect the following queries and mutations.

| Action  |  Query / Mutation | 
| - | - | 
| create | `createEntity` mutation | 
| read   | `type` and `types` query     | 
| update | `updateEntity` mutation      |
| delete | `deleteEntity` mutation |

<br/>

### Example 

```yaml
entities: 
  Car:
    attributes: 
      licence: Key
    permissions: 
      manager: 
        create: true
        read: true
        update: true
        delete: true
      assistant: 
        read: true
        delete: false
```

The configuration of the "manager" role is equivalent to the shorter notation `manager: true`. 

Any principal with the role "assistant" might only access the read queries. The configuration of the `delete` action is redundant, any action other than `read` is prohibited. 

<br>

## Permission Function

```typescript
export type PermissionExpressionFn = 
  (peCtx:PermissionExpressionContext) => Permission|Promise<Permission>

export type PermissionExpressionContext = {
  action:CRUD
  principal:PrincipalType
  role:string
  resolverCtx:ResolverContext,
  runtime:Runtime
}

export type Permission = undefined|boolean|PermissionExpression
export type PermissionExpression = object
```

While the other permission configurations are literal values and therefore can be expressed in YAML or JSON you can add a callback in the configuration object in which you can implement any desired permission behaviour based on the `PermissionExpressionContext`.

The possible return values of the Permission Function and their affects are as follows. You can also return a `Promise` of these values. 

| Value | Type | Description |  
| -------- | - | - |
| _no value_ | `undefined` | no effect - action might be allowed if granted by other roles | 
| `true`    | boolean | query and mutations of this entity for the action is allowed |
| `false`   | boolean | same as omitting - action might be allowed if granted by other roles |
| [Permission Expression](#permission-expression) | object | Expression used to filter permitted items for an action |

<br>

### Example

```typescript
const domainConfiguration:DomainConfiguration = {
  entity: {
    Car: {
      attributes: {
        brand: 'String!'
      }
      permissions: {
        manager: ({action}) => return _.includes(['read','create','update'], action ),
        assistant: ({action, principal}) => {
          if( action === CRUD.READ && principal.active === true ) return true;          
        }
      }
    }
  }
}
```

Any principal with the role "manager" is allowed any query and mutation of the entity, except the `delete` mutation. Of course this could have also be written as `action !== 'delete'` or even with static configuration.

Any principal with the role "assistant" might access the read queries if the principal object has an `active` property with the value `true`. This of course that the principal object somehow has this property set correctly - see [GAMA Principal](./gama-principal.md) how to achieve this. Here we just to demonstrate that you can use any object from the `PermissionExpressionContext` to determine the permission. 




## Permission Expression

You can not only express whether a principal might or might not access a certain query or mutation but also limit the permitted items affected by these queries and mutations. You can return an `expression` that is used to filter the items for the queries and mutations or check of a certain item might be allowed to be read or written. Only items that match the expression will be affected. 

Be aware that there can be multiple expressions for a principal. While it is sufficient for accessing a certain query or mutation that _just one_ role of the principal allows this, there can be multiple roles of a principal granting different limitations to the permitted items. In this case any item that matches _any_ of the expressions for a principal is permitted (think `or` join of expressions).

If _any_ of the roles of a principal allows unlimited access to a query or mutation (by having a permisson value `true`) no further expression will be evaluated. One `true` overrides all expression-limits. 

On the other hand if _any_ role provides an `expression` - the affected query or mutation is allowed. If no role provides an `expression` - the query or mutation is prohibited per se.

<br>

<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br><br>
<br>
<br>
<br>
<br><br>
<br>
<br>
<br>
<br><br>
<br>
<br>
<br>
<br>


## _______________Permission Expression ___________________

```typescript
export type PermissionExpression = PrincipalAssignedIds|PermissionExpressionFn
export type PermissionExpressionFn = (principal:PrincipalType, resolverCtx:ResolverContext, runtime:Runtime) => any
export type PrincipalAssignedIds = string
```

If the value of either a role or action permssion is a boolean - it has the effect that any affected query or  mutation is either allowed or prohibited regardless of the actual data handled by this query or mutation.

This is sometimes not fine grained enough - a principal might probably be allowed to read all entity items but may only create or update certain items and should not be allowed to delete any items at all. 

While - in this example - read would be simply `true` and delete `false` - we must find a way do define which exact items a principal might update or create. 

This can be done via `PermissionExpression`s that a role permission or action permission can provide. Think of an expression as an additional _filter_ to a query or mutation. Only data that match this _filter_ are allowed to be or read, created, updated, deleted. If multiple roles bestow more than one permission expression to a principal this would be true for any data that matches any of the expressions - think of an `or` join of _filters_.

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

You might see that the expression syntax is dependent on the datastore. This is a tiny difference here (since the default filter syntax is somehow leaned to the default _datastore_ implementation (MongoDB). But if you would decide to run your domain configuration with another _datastore_ implementation - say MySQL - things will break. 

On one hand this gives you all the freedom and possibilities the underlying _datastore_ technology offers, like complex aggregations, joins, calculations etc. On the other hand is your domain configuration now coupled to a certain _datastore_ implementation. You can possibly avoid this by delegating the creation of the expression to the datastore itself and using the (of course limited) possibilities of the filter definition for this entity. This is of course only the case if the non-default _datastore_ implementation does not introduce a different filter syntax than the default implementation - which it very well could. Than the example above could've been written with filter syntax like so:

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

A more complex example - that could not be implemented via default filter syntax would be if the user should be allowed to read and update cars of all asigned brands or every other car that has a higher mileage than `100,000`. A filter cannot do that. The MongoDB expression for this requirement would look like this: 

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

## Permission Delegate

If you have a `assocTo` relationship between two entities, you can delegate the permssion evaluation to the `assocTo` entity. Let's say there is the following _domain definition_.

```yaml
entity: 
  VehicleFleet:
    attributes: 
      name: Key
    permission:
      manager: true
      user: 
        read: true

  Car:
    attributes: 
      licence: Key
      brand: String
    assocTo: VehicleFleet
    permissions: VehicleFleet
```

<br/>


