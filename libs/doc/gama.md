# GAMA

We think [GraphQL](https://graphql.org) is a great way to expose your business domain to any client or 3rd party system. 
Implementing a GraphQL API is a tedious task though. You need to decide how to structure your schema, how to handle
concepts like searching, sorting, paging, validating. 
How to write resolvers that read data from and write data to a database or
similar, validate input etc.

GAMA supports this development with an oppinionated approach based on the configuration of a business domain 
(mainly entities and its relations to each other). You can check out the simplicity and power 
of a business-domain-configuration-based API creation by looking at an simple 
[Example for an Entity Configuration](./entity-configuration.md#example).


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

[overview]: ./gama-overview.png "GAMA Overview"

GAMA provides 4 packages: 

### Graph-on-Rails Server Library

The name Graph-on-Rails is a reminiscence to [Ruby-on-Rails](https://rubyonrails.org) which was a large influence to
the development of GAMA. It uses the concept of [Convention over configuration](https://en.wikipedia.org/wiki/Convention_over_configuration) and [Don't repeat yourself](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself).

The library is highly opionated how a business domain (mainly entities and CRUD operations) should be provided as
a GraphQL API. It uses a typed configuration to easily express domain logic from which it creates

  * a [GraphQL schema](https://graphql.org/graphql-js/basic-types/), 
  * default [Resolvers](https://graphql.org/learn/execution/) that uses a datastore to read/write application data from/to and
  * helper queries / resolver to provide the GAMA Admin UI with metadata so it can generate a generic UI.

### Graph-on-Rails Server Application

The server application ... TODO

### GAMA UI Angular Module

Angular Module ... TODO

### GAMA UI Angular Application

Angular Application ... TODO
