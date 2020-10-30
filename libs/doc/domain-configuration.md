# Domain Configuration 

The generation of the GraphQL schema and the read/write access to data and functionality through it is defined by a 
configuration of your business domain, mainly entities with its attributes.

It can be described by 

* a folder of yaml files with entity and enum configurations
* a Javascript object of the type DomainConfigurationType
* custom instances of Sub-Classes of
  ** Entity
  ** Enum

All of this can be combined. 

```
export type DomainConfigurationType = {
  entity?:{[name:string]:EntityConfig},
  enum?:{[name:string]:EnumConfig},
  locale?:string
}
```

