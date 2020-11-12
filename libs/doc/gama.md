# GAMA

We think [GraphQL](https://graphql.org) is a great way to expose your business domain to any client or 3rd party system. 
Implementing a GraphQL API is a tedious task though. You need to decide how to structure your schema, how to handle
concepts like searching, sorting, paging, how to implement resolvers that read data from 
and write data to a database or similar, validate input, relationships etc.

GAMA supports this development with an oppinionated approach based on the configuration of a business domain 
(mainly entities and its relations to each other). You can check out the simplicity and power 
of a business-domain-configuration-based API creation by looking at an simple 
[Example for an Entity Configuration](./entity-configuration.md#entity-configuration-example).

You can also check out the configuration documentation with lots of examples:

|   |    |
| ------------------------------------------------------- | ------------------------------------------------ |
| [Domain Configuration](./domain-configuration.md)       | Starting point to describe your business domain  |
| [Entity Configuration](./entity-configuration.md)       | How to describe entities in your business domain |
| [Attribute Configuration](./attribute-configuration.md) | Configuration of the attributes of your entities |


<br>


## Terminologies

We use the following terms in a dedicated meaning

### Business Domain 

Description of your real world domain in terms of entities, relationships and operations. Think of UML 
class diagrams.

### Domain Configuration

Any configuration in JSON, typescript or YAML to describe or configure (a part) of your business domain. 
A _Domain Configuration_ can consist of _Entity Configurations_, _Enum Configurations_, _Custom Queries_ and
_Custom Mutations_. 

### Entity Configuration

A configuration in JSON, typescript or YAML to describe an **entity** of your business domain with its 
attributes, validations, behaviour, relationships to other entites etc.

### DomainDefintion

You can seperate your _Domain Configuration_ (if you like) over many files or configuration objects. All your
configurations are turned into one _Domain Definition_. From this definition a GraphQL schema and all 
Query and Mutation Resolvers are generated. 

<br>


## Technologies 

GAMA is an acronym for **G**raphQL-**A**pollo-**M**ongodb-**A**ngular which should indicate the technologies it uses 
to provide a framework for business domain driven APIs / applications. 

Although you can use GAMA without deep knowledge of the underlying technologies - in fact GAMAs goal is exactly
to enable you to fully concentrate on your business domain without the need to engage in technical details - we 
encourage to familiarize with this technologies:

- GAMA is a [NodeJS](https://nodejs.org) framework that uses [Express](http://expressjs.com). 

- It uses the [Apollo Data Graph Platform](https://www.apollographql.com) 
and the [Apollo Server Express Middleware](https://www.apollographql.com/docs/apollo-server/)

- The configuration of your business domain can be done in Javascript/[Typescript](https://www.typescriptlang.org) or
in [YAML](https://yaml.org) files 

- GAMA has the concept of a _datastore_ where application data are read from and written to. GAMA ships with a default
implementation of a datastore that uses [MongoDB](https://www.mongodb.com/try/download/community). Other 
implemenatations that use e.g. relational databeses or even another API (e.g. REST) can be implemented.

- It also includes an [Angular](https://angular.io) application that provides a generic Admin UI if you want to 
provide users with the possibility to access your business domain API via web application.

## Overview

The following diagram shows an overview of GAMA

![GAMA Overview][overview]

[overview]: ./img/gama-overview.png "GAMA Overview"

GAMA provides 4 packages / modules: 

### Graph-on-Rails Server Library

The name Graph-on-Rails is a reminiscence to [Ruby-on-Rails](https://rubyonrails.org) which was a large influence to
the development of GAMA. It uses the concept of [Convention over configuration](https://en.wikipedia.org/wiki/Convention_over_configuration) and [Don't repeat yourself](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself).

The library is highly opionated how a business domain (mainly entities and CRUD operations) should be provided as
a GraphQL API. It uses a typed configuration to easily express domain logic from which it creates

  * a [GraphQL schema](https://graphql.org/graphql-js/basic-types/), 
  * default [Resolvers](https://graphql.org/learn/execution/) that uses a datastore to read/write application data from/to and
  * helper queries / resolver to provide the GAMA Admin UI with metadata so it can generate a generic UI.

### Graph-on-Rails Server Application

The server application to expose your GraphQL API. You can embed the Graph-on-Rails library in your own
express application or use this application as a boilerplate 
[Apollo Express Server](https://www.apollographql.com/docs/apollo-server/).

This (or your custom) application is the place for your domain configuration.

Please check out the [documentation](./server.md) for more information.

### GAMA UI Angular Module

An Angular Module that uses a Graph-on-Rails GraphQL API to create generic (often Admin) views and services to enable
a human user to interact with your API - search, list, sort entries and create, update, delete operations etc.

Please check out the [documentation](./angular-module.md) for more information.

### GAMA UI Angular Application

You can embedd the GAMA UI Angular Module in your own Angular application or use this boilerplate Angular application 
that provides the Admin UI in a generic fashion.

Please check out the [documentation](./angular-application.md) for more information.
