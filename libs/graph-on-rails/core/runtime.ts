import { GraphQLType } from 'graphql';
import _ from 'lodash';

import { FilterType } from '../builder/filter-type';
import { MetaDataBuilder } from '../builder/meta-data-builder';
import { SchemaBuilder, TypeBuilder } from '../builder/schema-builder';
import { Entity } from '../entities/entity';
import { EntityFileSave } from '../entities/entity-file-save';
import { EntityPermissions } from '../entities/entity-permissions';
import { EntityResolver } from '../entities/entity-resolver';
import { EntitySeeder } from '../entities/entity-seeder';
import { MongoDbDataStore } from '../mongodb-datastore/mongodb.data-store';
import { ValidateJs } from '../validation/validate-js';
import { Validator } from '../validation/validator';
import { DataStore } from './data-store';
import { DomainConfiguration, DomainDefinition } from './domain-definition';
import { GraphX } from './graphx';

export type Config = {
  name?:string
  dataStore?:(name?:string) => Promise<DataStore>
  validator?:(entity:Entity) => Validator
  entityResolver?:(entity:Entity) => EntityResolver
  entityPermissions?:(entity:Entity) => EntityPermissions
  entityFileSave?:(entity:Entity) => EntityFileSave
  entitySeeder?:(entity:Entity) => EntitySeeder
  contextUser?:string
  contextRoles?:string
  schemaBuilder?:SchemaBuilder[]
  metaDataBuilder?:SchemaBuilder
  domainDefinition?:DomainDefinition|DomainConfiguration|string|string[]
  uploadRootDir?:string[]
}

export class Runtime {

  dataStore!:DataStore;

  private constructor( public readonly config:Config ){ }

  readonly graphx = new GraphX();
  readonly entities:{[name:string]:Entity} = {};
  readonly filterTypes:{[name:string]:FilterType} = {};

  readonly contextUser = this.config.contextUser;
  readonly contextRoles = this.config.contextRoles;

  /**
   *
   */
  static async create( config?:Config ):Promise<Runtime> {
    if( ! config ) config = {};
    const defaultConfig = this.getDefaultConfig();
    _.defaults( config, defaultConfig );
    const context = new Runtime(config);
    await context.init();
    return context;
  }

  private static getDefaultConfig():Config {
    return {
      name: 'GAMA',
      dataStore: ( name?:string ) => MongoDbDataStore.create({ url: 'mongodb://localhost:27017', dbName: name || 'GAMA' }),
      validator: ( entity:Entity ) => new ValidateJs( entity ),
      entityResolver: ( entity:Entity ) => new EntityResolver( entity ),
      entityPermissions: ( entity:Entity ) => new EntityPermissions( entity ),
      entityFileSave: ( entity:Entity ) => new EntityFileSave( entity ),
      entitySeeder: ( entity:Entity ) => new EntitySeeder( entity ),
      metaDataBuilder: new MetaDataBuilder(),
      contextUser: 'user',
      contextRoles: 'roles',
      uploadRootDir: ['server', 'uploads']
    };
  }

  async init(){
    if( ! _.isFunction(this.config.dataStore) ) throw new Error('Context - you must provide a dataStore factory method' );
    this.dataStore = await this.config.dataStore( this.config.name );
  }

  get domainDefinition():DomainDefinition {
    if( ! (this.config.domainDefinition instanceof DomainDefinition) ) this.config.domainDefinition =
      new DomainDefinition( this.config.domainDefinition );
    return this.config.domainDefinition;
  }


  validator( entity:Entity ) {
    if( ! this.config.validator ) throw new Error('Context - you must provide a validator factory method' );
    return this.config.validator(entity);
  }

  entityResolver( entity:Entity ) {
    if( ! this.config.entityResolver ) throw new Error('Context - you must provide an entityResolver factory method' );
    return this.config.entityResolver(entity);
  }

  entityPermissions( entity:Entity ) {
    if( ! this.config.entityPermissions ) throw new Error('Context - you must provide an entityPermissions factory method' );
    return this.config.entityPermissions(entity);
  }

  entityFileSave( entity:Entity ) {
    if( ! this.config.entityFileSave ) throw new Error('Context - you must provide an entityFileSave factory method' );
    return this.config.entityFileSave(entity);
  }


  entitySeeder( entity:Entity ) {
    if( ! this.config.entitySeeder ) throw new Error('Context - you must provide an entitySeeder factory method' );
    return this.config.entitySeeder(entity);
  }

  filterType( filterType:string|FilterType|false|undefined, fieldType:string|GraphQLType ):FilterType|undefined {
    if( filterType === false ) return undefined;
    if( ! filterType ) {
      if( ! _.isString( fieldType ) ) fieldType = _.get( fieldType, 'name' );
      return this.filterTypes[ TypeBuilder.getFilterName(fieldType as string) ];
    } else if( _.isString( filterType ) ) {
      return this.filterTypes[ filterType ];
    } else return filterType;
  }

  warn<T>( message:string, returnValue:T ):T{
    console.warn( message );
    return returnValue;
  }

}