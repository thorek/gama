# Entity Configuration

```typescript
export type EntityConfig  = {
  typeName?:string;
  plural?:string
  singular?:string;
  collection?:string;
  path?:string;

  attributes?:{[name:string]:string|AttributeConfig};
  assocTo?:string|(string|AssocToType)[];
  assocToMany?:string|(string|AssocToManyType)[];
  assocFrom?:string|string[]|AssocFromType[];

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

From the definition of an _entity_ a full fledged GraphQL schema is generated incl. resolver to a _data store_. The behaviour is strongly oppionated and uses mostly conventions; nonetheless you can configure most of the details.

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
const domainConfiguration = {
  Car: {
    attributes: {
      brand: 'string!',
      mileage: 'int'
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
  createdAt: String
  updatedAt: String
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
  cars(filter: CarFilter, sort: CarSort): [Car]
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

## id

As you see any entity gets a unique `id` that is used to identify any item (instance) of an _entity_. This `id` is also used to implement the relationship of entities.

The `id` is assigned by the framework (in fact the actual datastore implementation) when you call the _create_ mutation. 

## timestamps

Every entity type has `createdAt` and `updatedAt` timestamp fields. That are set automatically by the mutation resolvers. 

# Properties of Entity configuration

## typeName

The `typeName` is the name GraphqlType in the schema. Per default it is identical to the `name` of this _entity_ in the _domain configuration_. Only set this if know very well, what you want to achieve.

_YAML_
```yaml
entity: 
  Car: 
  Driver: 
    typeName: Chauffeur
```

_Code_
```javascript
const domainConfiguration = {
  Car: {}, 
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
_AttributeConfiguration_ for details.

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
