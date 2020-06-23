# Gama

This is the development project for 

#### GAMA on Rails

an attempt to create a framework that 

  * allows the simple definition of an application domain in form of entities (and enums, scalars etc.) - with 
      Convention over Configuration and DRY in mind
  * provides a full fledged oppinionated GraphQL API - powered by https://www.apollographql.com
  * provides a Admin UI for basic CRUD applications - based on https://angular.io and https://ng.ant.design/
  * allows to extend any non-convention requirement with custom code

#### D2PROM

a prototype application for managing data protection requirements and measures for an organisation according to the
GDPR 

## Repository

There are 2 applications inside this monorepo. You can run both of them concurrently via 

```
  npm run start:dev
```

### Angular 

An angular application that holds the GAMA Admin UI and D2PROM UI - this will later be seperated. You can start this
seperately via 

```
  ng serve
```

### Express 

An express application that generates the GraqhQL schema based on a domain configuration and starts an Apollo server.
You can start this seperately via 

```
  npm run run
```
