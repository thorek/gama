# Domain Configuration 

The generation of the GraphQL schema and the read/write access to data and functionality through it is defined by a 
configuration of your business domain, by large parts entities with its attributes in addition to custom queries and
mutations.

The Domain Configuration is Javascript object of the type

```
type DomainConfiguration = {
  entity?:{[name:string]:EntityConfig},
  enum?:{[name:string]:EnumConfig},
  query?:{[name:string]:QueryConfigFn},
  mutation?:{[name:string]:MutationConfigFn}
}
```

You can provide the _Runtime_ with such an object (or multiple that will be merged) or write this in YAML files
and point to folder(s) where to find this Domain Configuration files.

### Schema and Resolvers

The Domain Configuration will be translated to a GraqhQL Schema and corresponding resolvers. How the schema and 
resolver for Entities and Enums are structured is highly oppionoated, but can be influenced and even replaced
by a total different implementation and can always be complemanted by adding custom queries, mutations, 
types and resolvers. 

### GraphQL API

The generated Schema and Resolvers are made available as a GraphQL API using Apollo Express. This can be used by 
any GrapqhQL Client - restrictions in regards of accessing the API are out of concern of GAMA and should be handled
on a lower level.

### GAMA Admin UI

Based on the Schema and some meta information from the Domain Configuration a generic Admin UI is generated. 
This Application can be customized as well.


## Examples

### Javascript Object 

```javascript
{
  enum: {
    CarBrand: ['Mercedes', 'BMW', 'Volkswagen', 'Audi', 'Porsche', 'Toyota', 'Bentley']
  },
  entity: {
    car: {
      attributes: {
        brand: 'CarBrand',
        mileage: 'int'
      }
    }
  },
  query: {
    leMansWinner: (rt:Runtime) => ({
      type: rt.type('[Int!]'),
      args: { brand: { type: rt.type('CarBrand') } },
      resolve: ( root:any, args:any ) => _.get( {
        Toyota: [2020, 2019, 2018], 
        Porsche: [2017,2016,2015,2014,2013,2012,2011,2010], 
        Peugeot: [2009], 
        Audi: [2008,2007,2006,2005,2004], 
        Bentley:[2003]
      }, args.brand )
    })
  }
}
```

In this example we define an Enum, an Entity, which defines types (the type "Car" itself, but also Filter 
and Input Types etc.) and Querys/Mutations regarding this types. We also added a non-Entity based query (Winners
of the Le Mans Race). You might realize we are not using any GraphQL type directly but instead the `runtime.type`
method. This is mainly because of an Apollo scpecific we will cover in the _Custom Querys_ section.

