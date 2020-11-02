# Gama

This is the development project for 

#### GAMA on Rails

an attempt to create a framework that 

  * allows the simple definition of an application domain in form of entities (and enums, scalars etc.) - with 
      Convention over Configuration and DRY in mind
  * provides a full fledged oppinionated GraphQL API - powered by https://www.apollographql.com
  * provides a Admin UI for basic CRUD applications 
  * allows to extend any non-convention requirement with custom code


## Repository

There are 2 applications inside this monorepo. You can run both of them concurrently via 

```
  npm run gama
```

be sure to call `npm install` in all of the following folders before

  * libs/graph-on-rails
  * express
  * angular

### Angular 

An angular application that holds the GAMA Admin UI. You can start this as any angular application 

```
  ng serve
```

### Express 

An express application that generates the GraqhQL schema based on a domain configuration and starts an Apollo server.
You can start this seperately via 

```
  npm run start
```
