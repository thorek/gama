# Resolver Hooks

An easy way to extend the implementation of GAMA resolvers are _entitiy hooks_. You can define this as part of the `EntityConfiguration` object. 

```typescript

export type EntityConfig  = {
  // other properties left out
  hooks?:EntityHooksType
}

export type EntityHooksType = {
  preSave?: ( ctx:ResolverContext ) => void|undefined|object
  afterSave?: ( resolved:any, ctx:ResolverContext ) => object
  preTypeQuery?: ( ctx:ResolverContext ) => void|undefined|object
  afterTypeQuery?: ( resolved:any, ctx:ResolverContext ) => object
  preTypesQuery?: ( ctx:ResolverContext ) => void|undefined|object
  afterTypesQuery?: ( resolved:any, ctx:ResolverContext ) => object
  preDelete?: ( ctx:ResolverContext ) => void|undefined|object
  afterDelete?: ( resolved:any, ctx:ResolverContext ) => object
}
```

In any _hook_ function you get the `ResolverContext` which holds the data from the GraphQL layer and which you can use to perform any task or influencing the default implementation.

```typescript
export type ResolverContext = {
  root:any
  args:any
  context:any
}
```

The `beforeHooks` can interrupt the normal execution flow by returning an `object`. This would be handled as the result that will be sent to the client. In other words - if a `beforeXXX` hook returns `void` or `undefined` the regular implementation will be executed.

In the the `afterXXX` hooks you also get the `result` that is about to be sent to the client. Hooks can change the `resolverContext` and `result` to influence the behaviour. A hook must return this `result` either changed or untouched, otherwise nothing will be sent to the client.

## Example

<div style="font-size:0.8em">

```typescript 
const domainConfiguration:DomainConfiguration = {
  entity: {
    Car: {
      hooks: {
        preTypeQuery: () => console.log( 'preType' ),
        afterTypeQuery: (result:any) => { console.log( "afterTypeQuery"); return result },
        preTypesQuery: () => console.log( 'preTypes' ),
        afterTypesQuery: (result:any) => { console.log( "afterTypesQuery"); return result },
        preSave: () => console.log( 'preSave' ),
        afterSave: (result:any) => { console.log( "afterSave"); return result },
        preDelete: () => console.log( 'preDelete' ),
        afterDelete: (result:any) => { console.log( "afterDelete"); return result },
      }

    }
  }
}
```
</div>



