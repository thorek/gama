# Domain Configuration 

The generation of the GraphQL schema and the read/write access to data and functionality is defined by a 
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
by a total different implementation and can always be complemented by adding custom queries, mutations, 
types and resolvers. 

For detailed documentation see

  * [Entity Configuration](./entity-configuration.md)
  * [Enum Configuration](./enum-configuration.md)
  * [Custom Query Configuration](./custom-query-configuration.md)
  * [Custom Mutation Configuration](./custom-mutation-configuration.md)


### GraphQL API / Apollo Express

The generated Schema and Resolvers can be made available as a GraphQL API using an [Express](http://expressjs.com)
/ [Apollo](https://www.apollographql.com) NodeJS application. 

GAMA includes a default / example application that you can customize.

This can be used by any GrapqhQL Client - restrictions in regards of accessing 
the API are out of concern of GAMA and should be handled on a custom level.

For detailed documentation see: [GAMA Express Application](./gama-express.md)


### GAMA Admin UI

Based on the Schema and some meta information from the Domain Configuration GAMA includes an optional 
[Angular](https://angular.io) application that provides a generic Admin UI. 

This Application can be customized as well.

For detailed documentation see: [GAMA Angular Admin UI](./gama-angular.md)

## Example

### Javascript Object 

```javascript
const winnerYear = {
  Toyota: [2020, 2019, 2018],
  Porsche: [2017,2016,2015,2014,2013,2012,2011,2010],
  Peugeot: [2009],
  Audi: [2008,2007,2006,2005,2004],
  Bentley:[2003]
}

const repaint = async (rt:Runtime, id:string, color:string) => {
  const car = rt.entity('Car');
  const c = await car.findById( id );
  c.item.color = color;
  await c.save();
  return c.item;
}


export const example1:DomainConfiguration = {
  enum: {
    CarBrand: ['Mercedes', 'BMW', 'Volkswagen', 'Audi', 'Porsche', 'Toyota', 'Bentley']
  },
  entity: {
    car: {
      attributes: {
        brand: 'CarBrand',
        mileage: 'int',
        color: 'string'
      }
    }
  },
  query: {
    leMansWinner: (rt:Runtime) => ({
      type: '[Int!]',
      args: { brand: { type: 'CarBrand' } },
      resolve: ( root:any, args:any ) => _.get( winnerYear, args.brand as string )
    })
  },
  mutation: {
    repaint: (rt:Runtime) => ({
      type: 'Car',
      args: { id: { type: 'ID' }, color: { type: 'String!' } },
      resolve: async (root:any, args:any) => repaint( rt, args.id, args.color )
    })
  }
}
```

In this example we define an Enum, an Entity, which defines types (the type "Car" itself, but also Filter 
and Input Types etc.) and Querys/Mutations regarding this types. We also added a non-Entity based query (Winners
of the Le Mans Race) and a custom mutation (repaint). You might realize we are not using any GraphQL type 
directly but its string representation. This is mainly because of an Apollo scpecific we will cover in the 
_Custom Querys and Mutation_ section.

This example would lead to the following schema: 

```graphql
type Car {
  id: ID!
  brand: CarBrand
  mileage: Int
  color: String
  createdAt: Date
  updatedAt: Date
}

enum CarBrand {
  MERCEDES
  BMW
  VOLKSWAGEN
  AUDI
  PORSCHE
  TOYOTA
  BENTLEY
}

input CarBrandFilter {
  ne: CarBrand
  eq: CarBrand
  in: [CarBrand]
  notIn: [CarBrand]
}

input CarCreateInput {
  brand: CarBrand
  mileage: Int
  color: String
}

input CarFilter {
  id: ID
  brand: CarBrandFilter
  mileage: IntFilter
  color: StringFilter
}

enum CarSort {
  brand_ASC
  brand_DESC
  mileage_ASC
  mileage_DESC
  color_ASC
  color_DESC
  id_ASC
  id_DESC
}

input CarUpdateInput {
  id: ID!
  brand: CarBrand
  mileage: Int
  color: String
}

scalar Date

type entityMetaData {
  path: String
  typeQuery: String
  typesQuery: String
  deleteMutation: String
  updateMutation: String
  updateInput: String
  createMutation: String
  createInput: String
  foreignKey: String
  fields: [fieldMetaData]
  assocTo: [assocMetaData]
  assocToMany: [assocMetaData]
  assocFrom: [assocMetaData]
}

input EntityPaging {
  page: Int!
  size: Int!
}

type EntityStats {
  count: Int!
  createdFirst: Date
  createdLast: Date
  updatedLast: Date
}

type fieldMetaData {
  name: String!
  type: String
  required: Boolean
  validation: JSON
  unique: String
  calculated: Boolean
  filter: String
  mediaType: String
}

input IntFilter {
  eq: Int
  ne: Int
  le: Int
  lt: Int
  ge: Int
  gt: Int
  isIn: [Int]
  notIn: [Int]
  between: [Int]
}

scalar JSON

type Mutation {
  ping(some: String): String
  seed(truncate: Boolean): String
  createCar(car: CarCreateInput): SaveCarMutationResult
  updateCar(car: CarUpdateInput): SaveCarMutationResult
  deleteCar(id: ID): [String]
}

type Query {
  ping: String
  metaData(path: String): [entityMetaData]
  leMansWinner(brand: CarBrand): [Int!]
  car(id: ID): Car
  cars(filter: CarFilter, sort: CarSort, paging: EntityPaging): [Car]
  carsStats(filter: CarFilter): EntityStats
}

type SaveCarMutationResult {
  validationViolations: [ValidationViolation]!
  car: Car
}

input StringFilter {
  is: String
  isNot: String
  in: [String]
  notIn: [String]
  contains: String
  doesNotContain: String
  beginsWith: String
  endsWith: String
  caseSensitive: Boolean
}

type ValidationViolation {
  attribute: String
  message: String!
}
```

