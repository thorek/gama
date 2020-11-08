# Entity Configuration

A business domain is mainly described by its entities and their relation to each other. Think of an _entity_ as any 
_thing_ in your business domain. We highly recommend using a [Domain Driven Design](https://www.amazon.de/Domain-Driven-Design-Tackling-Complexity-Software/dp/B001JDYE0O) approach.

### Configuration Type

The configuration of an entity is done by an object of the following type: 

```typescript
export type EntityConfig  = {
  attributes?:{[name:string]:string|AttributeConfig};
  assocTo?:string|(string|AssocToType)[];
  assocToMany?:string|(string|AssocToManyType)[];
  assocFrom?:string|string[]|AssocFromType[];

  typeName?:string;
  plural?:string
  singular?:string;
  collection?:string;
  path?:string;

  union?:string[]
  interface?:boolean
  implements?:string|string[]

  seeds?:{[seedId:string]:SeedConfigType}
  permissions?:null|EntityPermissionType
  assign?:string
  description?:string

  extendEntity?:( context:Context ) => void | Promise<void>
}
```

You can also write the entity configuration in yaml files and simply includes these files in your 
[Domain Definition](./domain-definition).

From the definition of an _entity_ a full fledged GraphQL schema is generated incl. resolver to a _data store_. 
The behaviour is strongly oppionated and uses mostly conventions; nonetheless you can configure most of the details. 
You will probably only ever use the following configuration attributes: 

  * `attributes` the attributes of the entity
  * `assocTo`, `assocToMany`, `assocFrom` to express the relation of one entity to another (has relationships)
  * `union`, `interface`, `implements` to express identity relations between entities
  * `permissions` to configure the access of users and roles to entity data
  * `seeds` to declare seed data you can use to develop or run your API
  * `description` to document the entity in the GraqphQL schema


## <a name="example"></a> Example

Let's look at a very simple example that does not yet use any of the more sophisticated features but a mere 
defintion of a business entity with some basic attributes.

_YAML_
```yaml 
entity:
  Car:
    attributes:
      brand: string!
      mileage: int
```

The same configuration in code 

```javascript
export const example2:DomainConfiguration = {
  entity:{
    Car: {
      attributes: {
        brand: 'string!',
        mileage: 'int'
      }
    }
  }
}
```

will create

* a type definition
* a query for the type (by id)
* a query for a list of types (with filter and sort)
* a filter for the type 
* filter types for all Types and Scalars
* a sort enum for the list query
* a create mutatation
* an update mutatation
* an input type for the create mutatation
* an input type for the update mutatation
* a result type for create and update mutations
* resolver for the queries and mutations that read/write to a data store (per default a mongo db)
* and some helper types, query and mutations we'll cover later

_generated fully functional GraphQL schema (excerpt)_
```graphql
type Car {
  id: ID!
  brand: String!
  mileage: Int
  createdAt: Date
  updatedAt: Date
}

input CarCreateInput {
  brand: String!
  mileage: Int
}

input CarFilter {
  id: ID
  brand: StringFilter
  mileage: IntFilter
}

enum CarSort {
  brand_ASC
  brand_DESC
  mileage_ASC
  mileage_DESC
  id_ASC
  id_DESC
}

input CarUpdateInput {
  id: ID!
  brand: String
  mileage: Int
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

Let's break this simple example down

### Type

```graphql
type Car {
  id: ID!
  brand: String!
  mileage: Int
  createdAt: Date
  updatedAt: Date
}
```

The `car` entity becomes a GraphQL type with attributes from the _Entity definition_ becoming attributes of this type. 
As you see, in addition an entity gets a unique `id` that is used to identify any item (instance) of an _entity_. 
This `id` is also used to implement the relationship of entities.

The `id` is assigned by the framework (in fact the actual datastore implementation) when you call the _create_ mutation. 

Every entity type has also `createdAt` and `updatedAt` timestamp fields. That are set automatically by the mutation resolvers. 

### Input Types

The mutations use _Input Types_ to hold the value of items that should be created or updated. 

```graphql
input CarCreateInput {
  brand: String!
  mileage: Int
}

input CarUpdateInput {
  id: ID!
  brand: String
  mileage: Int
}
```

As you see there are seperate types used by the create and update mutations. The CreateType does not have an `id` - 
this will be assigned by the _datastore_, where the UpdateType does. The `id` determines which entity item should be 
updated. Also note that the `brand` attribute in this case is not a mandatory field in the `CarUpdateInput`, even it 
is configured as such, and the `CarCreateInput` does have it as mandatory. This is because a client is not forced to 
pass all attributes in the _update mutation_ but only those it wants to change. But making required attributes 
mandatory in the GraphQL schema would not allow to leave the brand untouched. 

### Filter

```graphql
input CarFilter {
  id: ID
  brand: StringFilter
  mileage: IntFilter
}
```

For every entity-type a filter-type is created that is used in the types query. For every attribute a corresponding
filter type is determined. E.g. the `StringFilter` for the `brand` attribute. This filter-types are defined by 
the _datastore_ since their implementation is dependent to the datastore (e.g. database). For this example
the default _mongodb datastore_ provides the following _scalar filter-types_:

```graphql
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
```

For more details check [Filter Types](./filter-types.md)

### Sort

```graphql
enum CarSort {
  brand_ASC
  brand_DESC
  mileage_ASC
  mileage_DESC
  id_ASC
  id_DESC
}
```

The _types query_ uses this the _entity sort enum_ to determine the sort order of the result. For every attribute 
(unless configured otherwise) two enum values are created. One for ascending order (e.g. `brand_ASC`) and one for
descending order (e.g. `mileage_DESC`).

### Paging 

```graphql
input EntityPaging {
  page: Int!
  size: Int!
}
```

If a query to the _types query_ wants to use a subset instead of the whole result it can use the _paging input type_.
So a result set with 100 items would deliver the first 10 items when used with the query 

```graphql
  query {
    cars( paging: { page: 0, size: 10 } )
  }
```

For the next 10 items it would be 
```graphql
  query {
    cars( paging: { page: 1, size: 10 } )
  }
```

Pages start with 0.

### Queries

```graphql
type Query {
  ping: String
  car(id: ID): Car
  cars(filter: CarFilter, sort: CarSort, paging: EntityPaging): [Car]
  carsStats(filter: CarFilter): EntityStats
}
```

Any schema includes a query `ping` that simply sends back the value `pong` and can be used whether a GraphQL API can 
be accessed without the need to build any specific query or mutation.

#### Type Query

If a client knows the `id` of an entity item it can access this via the type query, eg. 
```graphql
query {
  car( id:"5fa5138860b514597c3c6fa5"){ id brand mileage }
}
```

If this `id` does not exist an exception will be thrown. 

#### Types Query

A client can request a result set of entity items with filtering, sorting and paging, e.g.
```graphql
query {
  cars { id brand  mileage} 
}
```
will return all car entities in no specific order.

A more sophisticated usage of the `cars` _types query_:
```graphql
query {
  cars( 
    filter: { brand: { in: [ "Mercedes", "Porsche"] } }
    sort: mileage_DESC
    paging: { page: 0, size: 3 }    
  ) 
  { id brand  mileage} 
}
```
would return the three `cars` of the brand "Mercedes" and "Porsche" with the highest `milage`.


### Mutations 

```graphql
type Mutation {
  ping(some: String): String
  seed(truncate: Boolean): String
  createCar(car: CarCreateInput): SaveCarMutationResult
  updateCar(car: CarUpdateInput): SaveCarMutationResult
  deleteCar(id: ID): [String]
}
```

Any schema includes a mutation `ping` that simply sends the value back and can be used wheter a GraphQL API can 
be accessed without the need to build any specific query or mutation.

```graphql
mutation {
    ping(some: "Thomas")
}
```

```json
{
  "data": {
    "ping": "pong, Thomas!"
  }
}
```

Also any schema comes with the `seed` mutation that can be called to seed the datastore with seed data, as defined
in the _entity configuration_. Since we haven't included any seed data in this simple example - nothing would 
happen, except when you would call 
```graphql
mutation {
    seed(truncate: true)
}
``` 
In this case all entity collections (e.g. tables) in the datastore would be truncated. So you should use this 
carefully.

TODO - should be disabled in production.

The _create, update, delete mutations_ will take the input values and create, update or delete the entity item 
in the datastore.

### Mutation Result Types

The _create and update mutations_ have a different return whether the operation could be executed or validation
errors prevented this. They return a _mutation result type_ that hold either the _validation violations_ or the
successfully created/updated entity item.

```graphql
type SaveCarMutationResult {
  validationViolations: [ValidationViolation]!
  car: Car
}

type ValidationViolation {
  attribute: String
  message: String!
}
```

To get possible validation errors from a `createCar` mutation or the assigned id of the newly created car, 
a client would use something like the following mutation:
```graphql
mutation {
  createCar( car: { brand: "Porsche", mileage: 20000 } ){ 
    validationViolations { attribute message } 
  	car { id }
}
``` 

Since we did not include any validation in our simple example we would always get the `id` from this mutation. Any 
non-validation error would lead to an exception in the GraphQL layer and its handling is not part of the schema.

### Statistics

A client can request some basic statistics about the entity. This can also be used for filtered result sets. 

  * `count` the number of items
  * `createdFirst` the date when the first item was created
  * `createdLast` the date when the last item was created
  * `updatedLast` the date when the first item was updated

```graphql
type EntityStats {
  count: Int!
  createdFirst: Date
  createdLast: Date
  updatedLast: Date
}
```
To know how many `cars` of the brand 'Porsche' exist a client can use the following query:
```graphql
  query {
    carsStats( filter: {brand: "Porsche" } ){ count }
  }
```

This example covered just some basic concepts. Please refer to the documentation to see the possibilities to 
translate your business domain into a GraqphQL API and UI.



# Properties of Entity configuration

## typeName

The `typeName` is the name GraphqlType in the schema. Per default it is _capitalized_ `name` of this _entity_ in the 
_domain configuration_. Only set this if know very well, what you want to achieve.

_YAML_
```yaml
entity: 
  car: 
  Driver: 
    typeName: Chauffeur
```

_Code_
```javascript
const domainConfiguration = {
  car: {}, 
  Driver: { typeName: 'Chauffeur' }
}
```

_Schema (excerpt)_
```graphql

type Car {
  id: ID!
  createdAt: String
  updatedAt: String
}


type Chauffeur {
  id: ID!
  createdAt: String
  updatedAt: String
}

type Mutation {
  createCar(car: CarCreateInput): SaveCarMutationResult
  updateCar(car: CarUpdateInput): SaveCarMutationResult
  deleteCar(id: ID): [String]
  createChauffeur(chauffeur: ChauffeurCreateInput): SaveChauffeurMutationResult
  updateChauffeur(chauffeur: ChauffeurUpdateInput): SaveChauffeurMutationResult
  deleteChauffeur(id: ID): [String]
}

type Query {
  car(id: ID): Car
  cars(filter: CarFilter, sort: CarSort): [Car]
  chauffeur(id: ID): Chauffeur
  chauffeurs(filter: ChauffeurFilter, sort: ChauffeurSort): [Chauffeur]
}

type SaveCarMutationResult {
  validationViolations: [ValidationViolation]!
  car: Car
}

type SaveChauffeurMutationResult {
  validationViolations: [ValidationViolation]!
  chauffeur: Chauffeur
}
```

We suggest to use the capitalized version of the type name as key in the `entity` object of the configuration.

## singular 

The `singular` of an entity is used to infere the name of the type if not stated otherwise. This name is used when refering to an instance of a type. Per default it is determined via inflection of the `name` of the _entity_ (lower letter). Only set this if you know very well what you want to achieve. 

_YAML_
```yaml
entity:
  Car: 
    attributes: 
      brand: string!
  Driver:
    attributes:
      name: string!
    assocTo: Car
```

_Schema for Car (excerpt)_
```schema

type Driver {
  car: Car
}

input DriverCreateInput {
  carId: ID
}

input DriverFilter {
  carId: ID
}

input DriverUpdateInput {
  carId: ID
}

type Mutation {
  createCar(car: CarCreateInput): SaveCarMutationResult
  updateCar(car: CarUpdateInput): SaveCarMutationResult
}

type Query {
  car(id: ID): Car
}

type SaveCarMutationResult {
  car: Car
}
```

## plural 

The `plural` of an entity is used to infere the name of a list of types if not stated otherwise. Per default it is determined via inflection of the `name` of the _entity_ (lower letter). Only set this if you know very well what you want to achieve.


_YAML_
```yaml
entity:
  Car: 
    attributes: 
      brand: string!
    assocFrom: Driver
  Driver:
    attributes:
      name: string!
    assocTo: Car
```

_Schema for Driver (excerpt)_
```schema

type Car {
  drivers: [Driver]
}

type Query {
  drivers(filter: DriverFilter, sort: DriverSort): [Driver]
}
```


## collection 

The `collection` property defines the collection or database table a _data-store_ should use to read and write _entities_.

Per default this is the `plural` of the entity.

## path

The `path` property is the identfier for this entity in the UI, because it is the _path_ in the url.

Per default this is the underscore version of the `plural` of the entity.

_YAML_
```yaml
entity:    
  TransportFleet: 
    ...
```

_Result_
```javascript
// path: transport_fleets
```


## attributes

The attributes of an entity as _key/value_ pairs. See
[Attribute Configuration](./attribute-configuration) for details.

_YAML_
```yaml
entity:    
  Car: 
    attributes: 
      brand: string!
      mileage: int
```

_Code_
```javascript
const domainConfiguration = {
  entity: {
    Car: {
      attributes: {
        brand: 'string!',
        mileage: 'int'
      }
    }
  }
}
```

## assocTo

Defines a _to one_ associaton from one entity to another. For details see _AssocTo Configuration_.

_YAML_
```yaml
entity:    
  Car: 
    attributes: 
      brand: string!
    assocTo: Trailer
  Trailer:
    attributes:
      load: int!
```

## assocToMany

Defines a _to many_ associaton from one entity to another where the ids of the _other_ entitiy are stored in the entity that holds this association. For details see _AssocToMany Configuration_.

_YAML_
```yaml
entity:    
  Car: 
    assocToMany: Driver
  Driver:
```

## assocFrom

Defines a _to many_ associaton from one entity to another where the id of the entitiy that holds this association is stored in the _other_ entity. This association needs a `assocTo` in the opposite entity- For details see _AssocFrom Configuration_.

_YAML_
```yaml
entity:    
  Car: 
    assocFrom: Driver
  Driver:
    assocTo: Car
```

## interface 

Defines an _entity_ as an _GraphQL interface_. As a convinience feature you can define attributes in an `interface` _entity_ that all _entities_ that `implement` this interface will inherit.

_YAML_
```yaml
entity:    
  Car: 
    interface: true    
    attributes:
      brand: string!
  Convertible:
    implements: Car
    attributes:
      softtop: boolean
  Sedan:
    implements: Car
    attributes:
      doors: int
```

## implements 

Defines an _entity_ `implements` an `interface` _entity_.

_YAML_
```yaml
entity:    
  Car: 
    interface: true    
    attributes:
      brand: string!
  Convertible:
    implements: Car
    attributes:
      softtop: boolean
  Sedan:
    implements: Car
    attributes:
      doors: int
```

_Schema (excerpt)_
```graphql
interface Car {
  id: ID!
  brand: String!
  createdAt: String
  updatedAt: String
}

type Convertible implements Car {
  id: ID!
  softtop: Boolean
  createdAt: String
  updatedAt: String
  brand: String!
}

type Mutation {
  deleteCar(id: ID): [String]
  createConvertible(
    convertible: ConvertibleCreateInput
  ): SaveConvertibleMutationResult
  updateConvertible(
    convertible: ConvertibleUpdateInput
  ): SaveConvertibleMutationResult
  deleteConvertible(id: ID): [String]
  createSedan(sedan: SedanCreateInput): SaveSedanMutationResult
  updateSedan(sedan: SedanUpdateInput): SaveSedanMutationResult
  deleteSedan(id: ID): [String]
}

type Query {
  cars(filter: CarFilter, sort: CarSort): [Car]
  convertible(id: ID): Convertible
  convertibles(filter: ConvertibleFilter, sort: ConvertibleSort): [Convertible]
  sedan(id: ID): Sedan
  sedans(filter: SedanFilter, sort: SedanSort): [Sedan]
}

type Sedan implements Car {
  id: ID!
  doors: Int
  createdAt: String
  updatedAt: String
  brand: String!
}
```

_GrapqhQL_
```graphql
mutation addCars {
  createSedan( sedan: { brand: "Volkswagen", doors: 4 } ){validationViolations{attribute message}}
	createConvertible( convertible: { brand: "Porsche", softtop: true }){validationViolations{attribute message}}
}
query listCars {
  cars { 
  	... on Convertible {
      softtop
    }
    ... on Sedan {
      doors
    }
    brand
    __typename 
  }
}
```

_Result_
```json
{
  "data": {
    "cars": [
      {
        "softtop": true,
        "brand": "Porsche",
        "__typename": "Convertible"
      },
      {
        "doors": 4,
        "brand": "Volkswagen",
        "__typename": "Sedan"
      },
      {
        "softtop": null,
        "brand": "Porsche",
        "__typename": "Convertible"
      },
      {
        "doors": 4,
        "brand": "Volkswagen",
        "__typename": "Sedan"
      }
    ]
  }
}
```

## union

Defines the _GraqpQL union_ of some entities. 

_YAML_
```yaml
entity:
  Convertible:
    attributes:
      brand: string
      softtop: boolean
  Sedan:
    attributes:
      brand: string
      doors: int
  Car:
    union:
      - Convertible
      - Sedan
```

_Schema (excerpt)_
```graphql
union Car = Convertible | Sedan
type Convertible {
  id: ID!
  brand: String
  softtop: Boolean
  createdAt: String
  updatedAt: String
}
type Sedan {
  id: ID!
  brand: String
  doors: Int
  createdAt: String
  updatedAt: String
}
```

_GraphQL_
```graphql
mutation addCars {
  createSedan( sedan: { brand: "Volkswagen", doors: 4 } ){ sedan: { id } }
	createConvertible( convertible: { brand: "Porsche", softtop: true }){ convertible: { id } } }
}
query listCars {
  cars { 
  	... on Convertible {
      brand
      softtop
    }
    ... on Sedan {
      brand
      doors
    }
    __typename 
  }
}
```

_Result_
```json
{
  "data": {
    "cars": [
      {
        "brand": "Porsche",
        "softtop": true,
        "__typename": "Convertible"
      },
      {
        "brand": "Volkswagen",
        "doors": 4,
        "__typename": "Sedan"
      }
    ]
  }
}
```

## seeds

Sometime you want to define some seed data to your application, you can easily initialize the data store with. 
You can configure this in the `seeds` section. 

_YAML_
```yaml
entity:
  Car:
    attributes:
      brand: string!
      licence: string!
      mileage: int
    seeds:
      - brand: Volkswagen
        licence: AA 1234
        mileage: 10000
      - brand: Mercedes
        licence: BB 2345
        mileage: 20000
      - brand: Porsche
        licence: CC 3456
        mileage: 30000
```

_GraphQL_
```graphql
mutation { 
  seed(truncate:true) 
}

query {
  cars {
    id
    brand
    licence
    mileage
  }
}
```

_Result_
```json
{
  "data": {
    "cars": [
      {
        "id": "5f5f49f1322e913ad41e6d3d",
        "brand": "Volkswagen",
        "licence": "AA 1234",
        "mileage": 10000
      },
      {
        "id": "5f5f49f1322e913ad41e6d3e",
        "brand": "Mercedes",
        "licence": "BB 2345",
        "mileage": 20000
      },
      {
        "id": "5f5f49f1322e913ad41e6d3f",
        "brand": "Porsche",
        "licence": "CC 3456",
        "mileage": 30000
      }
    ]
  }
}
```

For more details e.g. how to reference type items see _Seed Configuration_.
