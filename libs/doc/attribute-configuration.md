# Attribute Configuration

Entities have attributes describing the data of the entity. Many aspects to this can be configured by the follwowing 

### Configuration Type

```typescript
export type AttributeConfig = {
  type?:string;
  required?:boolean|'create'|'update'
  list?:boolean
  unique?:boolean|string
  description?:string
  filterType?:string|false;
  validation?:any;
  input?:boolean
  default?:any

  sortable?:string
  mediaType?:'image'|'video'|'audio'

  calculate?:( root?:any, args?:any, context?:any ) => any
}
```

Except the `calculate` and `validate` callbacks you can use YAML for the configuration as well. In the following 
examples we will use YAML and object configuration equally.  

### String shortcut

Instead of providing a config object you can simply write a string with the type instead. 
The rest of the attribute configuration object would then be set as default. 
You can even use all type shortcut notations (as `String!` or `Key` as described below) 
when using this. The follwing examples are equivalant:

<table width="100%" style="font-size: 0.9em">
<tr valign="top">
<td width="50%">
  Shortcut
</td>
<td width="50%">
  Resolved
</td>
</tr>
<tr valign="top">
<td width="50%">

```yaml
entity:
  Car: 
    attributes:
      brand: String!
      mileage: Int
      licence: Key
```

</td>
<td width="50%">

```yaml
entity:
  Car: 
    attributes:
      brand: 
        type: String
        required: true
      mileage: 
        type: Int
      licence: 
        type: String
        required: true
        unique: true    
```

</td>
</tr>
</table>

You can mix shortcut and regular configuration and you can use it in YAML or code.

<table width="100%" style="font-size: 0.9em">
<tr valign="top">
<td width="50%">
  Shortcut
</td>
<td width="50%">
  Resolved
</td>
</tr>
<tr valign="top">
<td width="50%">

```typescript
{
  entity: {
    Car: {
      attributes: {
        brand: { type: 'String', required: true },
        mileage: 'Int',
        licence: 'Key'
      }
    }
  }
}
```

</td>
<td width="50%">

```typescript
{
  entity: {
    Car: {
      attributes: {        
        brand: { 
          type: 'String', 
          required: true 
        },
        mileage: { 
          type: 'Int' 
        },
        licence: { 
          type: 'String', 
          required: true, 
          unique: true 
        }        
      }
    }
  }
}
```

</td>
</tr>
</table>

---
## Type

```typescript
  type?:string;
```

You can use a shortcut notations for the type attribute:

  * `Key` configures this attribute as as `String`, `required` and `unique`
  * trailing `!` sets the `required` attribute to true
  * surrounding `[]` sets the `list` attribute to true

The type of an attribute can be any Enum or Scalar type described as follows. Note that you should never use other 
entity types as attribute types but instead describe the relations between entities as 
[associations](./associations.md). 

#### **GraphQL scalar type**

You can use any GraphQL scalar type

  - `Int`  A signed 32‐bit integer.
  - `Float`  A signed double-precision floating-point value.
  - `String` A UTF‐8 character sequence.
  - `Boolean` true or false.
  - `ID` The ID scalar type represents a unique identifier, often used to refetch an object or as the key for a cache. The ID type is serialized in the same way as a String; however, defining it as an ID signifies that it is not intended to be human‐readable.

Although allowed it is advised not to use the `ID` type since GAMA uses this to identify entity items and establich
relations between entities (this primary and foreign keys).

Check also [GraphQL Type System](https://graphql.org/learn/schema/#type-system)

#### **GAMA scalar types**

GAMA provides in addition to the GraphQL scalar type the following scalar types:

  - `Date` String representation of a Date in the JSON data it serializes to/from `new Date().toJSON()` internally it
           converts it to a TypeScript Date object
  - `JSON` arbitrary JSON structure (you should use this with caution and prefer GraphQL types instead) 

#### **Enum**

An attribute can use any Enum type you add to the business domain configuration or directly to the schema.

### Example


<table width="100%" style="font-size: 0.9em">
<tr valign="top">
<td width="40%"> YAML Configuration </td> <td width="60%"> Resulting Config as Object </td>
</tr>
<tr valign="top"><td>

```yaml
enum: 
  CarBrand:
    - Mercedes
    - Audi
    - Porsche
    - BMW

entity: 
  Car: 
    attributes: 
      brand: CarBrand
      licence: Key
      mileage: Int    
      fuelConsumption: 
        type: Float
        required: true
      registration: Date
      hasHitch: Boolean
      repairProtocol: JSON



```

</td><td>

```typescript
{
  enum: {
    CarBrand: { 
      MERCEDES: 'Mercedes', 
      AUDI: 'Audi', 
      PORSCHE: 'Porsche', 
      BMW: 'BMW' 
    }
  },
  entity: {
    Car: {
      attributes: {
        brand: { type: 'CarBrand' }, 
        license: { type: 'String', unique: true, required: true },
        mileage: { type: 'Int' },
        fuelConsumption: { type: 'Float', required: true },
        registration: { type: 'Date' },
        hasHitch: { type: 'Boolean' },
        repairProtocol: { type: 'JSON' }
      }
    }
  }
}
```

</td></tr>
</table>



---
## Required

```typescript
  required?:boolean|'create'|'update'
```

| Value      | Shortcut        | Description                                                                    |
| ---------- | --------------- | ------------------------------------------------------------------------------ |
| **false**  | if not provided | no effect                                                                      |
| true       | attributeName!  | NonNull in the type and create input type, `{presence: true}` validation added |
| create     |                 | NonNull only create input type                                                 |
| update     |                 | NonNull only in update input type                                              | 

<br>

If you set the required modifier the corresponding field of the following types become an NonNull type in the 
GraphQL schema: 

* the type itself
* the input type for the create mutation

That means a client not providing a value for such field would result in a GrapqhQL error. 
Since the "required-requirement" is part of the public API you can expect any client to handle this correctly. 
If you prefer to allow a client to send null-values in a create mutation e.g. and instead of letting the GraphQL 
layer handle this "error" (by throwing an exception) you could instead use an attribute validation.

In addition to the schema field a `{ presence: true }` validation is added to the validation of this attribute (this
is true for the default `EntityValidator` using ValidateJS). 
You might ask why, since the GraphQL layer would prevent any non-null value. The answer is that custom mutations
could (and should) use an entity to create or update entity items. These values are not "checked" by the 
GraphQL schema of course. Therefore before saving an entity item, all validations - incl. this required - validation
must be met. 

The information will also be part of the MetaData and therefore used in the GAMA Admin UI to render a mandatory
input field for this attribute.

### Example

<table width="100%" style="font-size: 0.9em">
<tr valign="top">
<td width="50%">
  YAML
</td>
<td width="50%">
  Schema (excerpt)
</td>
</tr>
<tr valign="top">
<td width="50%">

```yaml
entity:
  Car: 
    attributes:
      brand: 
        type: String
        required: true
```

</td>
<td width="50%">

```graphql
type Car {
  id: ID!
  brand: String!
  createdAt: Date
  updatedAt: Date
}

input CarCreateInput {
  brand: String!
}
```

</td>
</tr>
</table>

<table width="100%" style="font-size: 0.9em">
<tr valign="top">
<td width="50%"> Request </td> <td width="50%"> Response </td>
</tr>
<tr valign="top"><td>

```graphql
mutation{
  createCar( car: { } ){
    car{ id brand }
    validationViolations { attribute message }
  }
}
```

</td><td>

```json
{
  "error": {
    "errors": [
      {
        "message": "Field \"CarCreateInput.brand\" of required type \"String!\" was not provided."
      }
  }
}
````

</td></tr>
</table>

---
## Unique

```typescript
unique?:boolean|string
```


| Value               | Shortcut  |  Description                                                     |
| ------------------- | --------- | ---------------------------------------------------------------- |
| **false**           | (default) | no effect                                                        |
| true                |           | adding validation of uniqueness of this attribute to the entity  |
| [other attribute]   |           | adding validation of uniqueness of this attribute to the entity within the scope ot this attribute |
| [assocTo Name]      |           | adding validation of uniqueness within the scope of the assoc of this attribute to the entity |

<br>

If an attribute is declared as unique, the entity validation checks that no equal value for this entity already
exists before any actual write to the datastore happens. If it finds the input value not unique it adds a message
to the `ValidationViolaton` return type.

If the attribute is not `required` - it would allow many null values though.

### Example

Let's assume we want to express the requirement that the licence number of a car should be unique. We could write

```yaml
entity: 
  Car: 
    attributes: 
      brand: String!
      licence: 
        type: String
        unique: true
```

<table width="100%" style="font-size: 0.9em">
<tr valign="top">
<td width="50%"> Request </td> <td width="50%"> Response </td>
</tr>
<tr valign="top"><td>

Let's see what cars already exist. 

```graphql
query {
  cars { id brand licence }
}
```

</td><td>

One car with the licence nr "HH-BO 2020" exists.

```json
{
  "data": {
    "cars": [
      {
        "id": "5faac51a51434df073bb2dad",
        "brand": "Mercedes",
        "licence": "HH-BO 2020"
      }
    ]
  }
}
````

</td></tr>
<tr valign="top"><td>

If we would attempt to create a 2nd car with the same licence ...

```graphql
mutation{
  createCar( car: { brand: "BMW", licence: "HH-BO 2020" } ) {
    car{ id brand licence }
    validationViolations { attribute message }
  }
}
```

</td><td>

... we would get a validation violation.

```json
{
  "data": {
    "createCar": {
      "car": null,
      "validationViolations": [
        {
          "attribute": "licence",
          "message": "value 'HH-BO 2020' must be unique"
        }
      ]
    }
  }
}
````

</td></tr>
<tr valign="top"><td>

Adding a car with a different licence ...

```graphql
mutation{
  createCar( car: { brand: "BMW", licence: "HRO-TR 1970" } ) {
    car{ id brand licence }
    validationViolations { attribute message }
  }
}
```

</td><td>

... passes all validations.

```json
{
  "data": {
    "createCar": {
      "car": {
        "id": "5faac61251434df073bb2db0",
        "brand": "BMW",
        "licence": "HRO-TR 1970"
      },
      "validationViolations": []
    }
  }
}
````

</td></tr>
</table>

### **Scoped attribute unique**

Sometimes a value must only be unique in a certain scope. Let' assume we want to make sure there is only one car
of a certain color in our car park. 

We could write

```yaml
entity: 
  Car: 
    brand: String
    color: 
      type: String
      unique: brand
```

<table width="100%" style="font-size: 0.9em">
<tr valign="top">
<td width="50%"> Request </td> <td width="50%"> Response </td>
</tr>
<tr valign="top"><td>

Let's see what cars already exist. 

```graphql
query {
  cars { id brand color }
}
```

</td><td>

There is a red Mercedes.

```json
{
  "data": {
    "cars": [
      {
        "id": "5faac94c7dc3c1f1d9a7bf6f",
        "brand": "Mercedes",
        "color": "red"
      }
    ]
  }
}
````

</td></tr>
<tr valign="top"><td>

Let's try to create another red Mercedes.

```graphql
mutation{
  createCar( car: { brand: "Mercedes", color: "red" } ) {
    car{ id brand color }
    validationViolations { attribute message }
  }
}
```

</td><td>

Validation does not pass. 

```json
{
  "data": {
    "createCar": {
      "car": null,
      "validationViolations": [
        {
          "attribute": "color",
          "message": "value 'red' must be unique within scope 'brand'"
        }
      ]
    }
  }
}
````

</td></tr>
<tr valign="top"><td>

A red BMW though ... 

```graphql
mutation{
  createCar( car: { brand: "BMW", color: "red" } ) {
    car{ id brand color }
    validationViolations { attribute message }
  }
}
```

</td><td>

... is created without objection.

```json
{
  "data": {
    "createCar": {
      "car": {
        "id": "5faac9cf7dc3c1f1d9a7bf70",
        "brand": "BMW",
        "color": "red"
      },
      "validationViolations": []
    }
  }
}
````

</td></tr>
</table>

### **Scoped assocTo unique**

If you have an `assocTo` relation to another entity - you can also scope the `unique` to this association. 

Lets assume we have multiple car parks and a car belong to exactly one car park. Any car has a "license" which 
is truly unique and also a "nickname" which should also be unique. 
But making the attribute "nickname" `unique` would prevent any two car parks to use the
same nickname - it should only be unique within the scope of a car park. So we could write:

```yaml 
entity: 
  CarPark: 
    attributes: 
      name: String!
  Car:
    assocTo: CarPark
    attributes: 
      licence: Key
      nickname: 
        type: String
        required: true
        unique: CarPark

```


---
## List scalars

```typescript
  list?:boolean
```

| Value      | Shortcut        | Description                                                                    |
| ---------- | --------------- | ------------------------------------------------------------------------------ |
| **false**  | (default)       | no effect                                                                      |
| true       | [attributeName] | type of this attrribute is a list of the scalar type                           |

<br>


