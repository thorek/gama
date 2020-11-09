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

### String shortcut

Instead of providing a config object you can simply write the type instead. The rest of the attribute configuration 
object will be set as default. You can even use all type shortcut notations (as `String!` or `Key` as described below) 
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

  * `Key` configures this attribute as as a unique `String`
  * trailing `!` sets the `required` attribute to true
  * surrounding `[]` sets the `list` attribute to true

The type of an attribute can be on of the following:

### GraphQL scalar type

You can use any GraphQL scalar type

  - `Int`  A signed 32‐bit integer.
  - `Float`  A signed double-precision floating-point value.
  - `String` A UTF‐8 character sequence.
  - `Boolean` true or false.
  - `ID` The ID scalar type represents a unique identifier, often used to refetch an object or as the key for a cache. The ID type is serialized in the same way as a String; however, defining it as an ID signifies that it is not intended to be human‐readable.

Although allowed it is advised not to use the `ID` type since GRAIL uses this to identify entity items and establich
relations between entities (this primary and foreign keys).

Check also [GraphQL Type System](https://graphql.org/learn/schema/#type-system)

### GRAIL scalar types

GRAIL provides in addition to the GraphQL scalar type the following scalar types:

  - `Date` String representation of a Date in the JSON data it serializes to/from `new Date().toJSON()` internally it
           converts it to a TypeScript Date object
  - `JSON` arbitrary JSON structure (you should use this with caution and prefer GraphQL types instead) 

### Enum

An attribute can use any Enum type you add to the business domain configuration or directly to the schema.

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

In addition to the schema field a `{ presence: true }` validation is added to the validation of this attribute. 
You might ask why, since the GraphQL layer would prevent any non-null value. The answer is that custom mutations
could (and should) use an entity to create or update entity items. These values are not "checked" by the 
GraphQL schema of course. Therefore before saving an entity item, all validations - incl. this required - validation
must be met. 

The information will also be part of the MetaData and therefore used in the GAMA Admin UI to render a mandatory
text field for this attribute.

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
        "message": "Field \"CarCreateInput.brand\" of required type \"String!\" was not provided.",
...
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
| **false**           | (default) | no effect                                                       |
| true                |           | adding validation of uniqueness of this attribute to the entity |
| assocTo Name        |           | adding validation of uniqueness within the scope of the assoc of this attribute to the entity |

<br>

If an attribute is declared as unique, the entity validation checks that no equal value for this entity already
exists before any actual write to the datastore happens. If it finds the input value not unique it adds a message
to the `ValidationViolaton` return type.

### Example

```yaml
entity:
  Car: 
    attributes:
      brand: 
        type: String
        unique: true
    seeds:
      mercedes: 
        brand: Mercedes
      vw: 
        brand: Volkswagen
```

<table width="100%" style="font-size: 0.9em">
<tr valign="top">
<td width="50%"> Request </td> <td width="50%"> Response </td>
</tr>
<tr valign="top"><td>

```graphql
mutation {
  createCar( car: { brand: "Mercedes" } ) {
    car{ id brand }
    validationViolations { attribute message }
  }
}
```

</td><td>

```json
{
  "data": {
    "createCar": {
      "car": null,
      "validationViolations": [
        {
          "attribute": "brand",
          "message": "value 'Mercedes' must be unique"
        }
      ]
    }
  }
}
````

</td></tr>
<tr valign="top"><td>

```graphql
mutation {
  createCar( car: { brand: "BMW" } ) {
    car{ id brand }
    validationViolations { attribute message }
  }
}
```

</td><td>

```json
{
  "data": {
    "createCar": {
      "car": {
        "id": "5fa97fa28d1025c90137bc01",
        "brand": "BMW"
      },
      "validationViolations": []
    }
  }
}
````

</td></tr>
</table>

Sometimes a value must only be unique in a certain scope, e.g. a department in an organisation. There is only one 
_HR department_ in any organisation. But there can be many organisations with an _HR department_. You can simply 
scope the `unique` configuration with a `assocTo` association to achieve this. 

### Example

```yaml
entity: {
  Organisation: 
    attributes: 
      name: Key
    assocFrom: Department
    seeds: 
      ms:
        name: Microsoft
      fb:
        name: Facebook
  
  Department: 
    attributes:   
      name: 
        type: String!
        unique: Organisation
    assocTo: Organisation!
    seeds: 
      hrms: 
        name: HR
        Organisation: ms
  }
}

```

<table width="100%" style="font-size: 0.9em">
<tr valign="top">
<td width="50%"> Request </td> <td width="50%"> Response </td>
</tr>
<tr valign="top"><td>

```graphql
query { 
  organisations{ id name departments { id name } }
}
```

</td><td>

```json
{
  "data": {
    "organisations": [
      {
        "id": "5fa98edc64b80ecc74810d81",
        "name": "Facebook",
        "departments": []
      },
      {
        "id": "5fa98edc64b80ecc74810d80",
        "name": "Microsoft",
        "departments": [
          {
            "id": "5fa98edc64b80ecc74810d82",
            "name": "HR"
          }
        ]
      }
    ]
  }
}
````

</td></tr>
<tr valign="top"><td>

```graphql
mutation {
  createDepartment( department: { 
    name: "HR" 
    organisationId: "5fa98edc64b80ecc74810d80"} ){
  department { id name organisation { id name } }
  validationViolations { attribute message }
  }
}
```

</td><td>

```json
{
  "data": {
    "createDepartment": {
      "department": null,
      "validationViolations": [
        {
          "attribute": "name",
          "message": "value 'HR' must be unique within scope 'Organisation'"
        }
      ]
    }
  }
}
````

</td></tr>
<tr valign="top"><td>

```graphql
mutation {
  createDepartment( department: { 
    name: "HR" 
    organisationId: "5fa98edc64b80ecc74810d81"} ){
  department { id name organisation { id name } }
  validationViolations { attribute message }
  }
}
```

</td><td>

```json
{
  "data": {
    "createDepartment": {
      "department": {
        "id": "5fa98f7964b80ecc74810d83",
        "name": "HR",
        "organisation": {
          "id": "5fa98edc64b80ecc74810d81",
          "name": "Facebook"
        }
      },
      "validationViolations": []
    }
  }
}
````

</td></tr>
</table>

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

