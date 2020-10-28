# Domain Configuration 

The generation of the GraphQL schema and the read/write access to data and functionality through it is defined by a configuration of your business domain, mainly entities with its attributes.

```
export type DomainConfigurationType = {
  entity?:{[name:string]:EntityConfig},
  enum?:{[name:string]:EnumConfig},
  locale?:string
}
```
