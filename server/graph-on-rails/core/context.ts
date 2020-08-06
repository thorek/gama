import { GraphQLType } from 'graphql';
import _ from 'lodash';

import { MongoDbDataStore } from '../../graph-on-rails-mongodb/mongodb.data-store';
import { EnumConfig } from '../builder/enum-config-builder';
import { FilterType } from '../builder/filter-type';
import { MetaDataBuilder } from '../builder/meta-data-builder';
import { SchemaBuilder } from '../builder/schema-builder';
import { EntityConfig } from '../entities/config-entity';
import { Entity } from '../entities/entity';
import { EntityFileSave } from '../entities/entity-file-save';
import { EntityPermissions } from '../entities/entity-permissions';
import { EntityResolver } from '../entities/entity-resolver';
import { EntitySeeder } from '../entities/entity-seeder';
import { ValidateJs } from '../validation/validate-js';
import { Validator } from '../validation/validator';
import { DataStore } from './data-store';
import { GraphX } from './graphx';
import { ResolverContext } from './resolver-context';

export type DomainConfigurationType = {
  entity?:{[name:string]:EntityConfig},
  enum?:{[name:string]:EnumConfig},
  locale?:string
}

export type GorConfig = {
  name?:string
  dataStore?:DataStore
  validator?:(entity:Entity) => Validator
  entityResolver?:(entity:Entity) => EntityResolver
  entityPermissions?:(entity:Entity) => EntityPermissions
  entityFileSave?:(entity:Entity) => EntityFileSave
  entitySeeder?:(entity:Entity) => EntitySeeder
  contextUser?:string
  contextRoles?:string
  extendSchema?:(context:Context) => void
  virtualResolver?:{[entity:string]:{[attribute:string]:( item:any, rctx?:ResolverContext ) => any|Promise<any> }}
  configFolder?:string[]
  schemaBuilder?:SchemaBuilder[]
  entities?:Entity[],
  metaDataBuilder?:SchemaBuilder,
  domainConfiguration?:DomainConfigurationType,
  uploadRootDir?:string[]
}

export class Context {
  get extendSchema() { return this.config.extendSchema }
  get virtualResolver() { return this.config.virtualResolver }

  private constructor( public readonly config:GorConfig ){}

  get dataStore() {
    if( ! this.config.dataStore ) throw new Error('Context - you must provide a dataStore' );
    return this.config.dataStore;
  }

  readonly graphx = new GraphX();
  readonly entities:{[name:string]:Entity} = {};
  readonly filterTypes:{[name:string]:FilterType} = {};

  readonly contextUser = this.config.contextUser;
  readonly contextRoles = this.config.contextRoles;

  /**
   *
   */
  static async create( name:string, config?:GorConfig):Promise<Context> {
    if( ! config ) config = {};
    if( ! config.dataStore ) config.dataStore = await this.getDefaultResolver( name );
    _.defaults( config, Context.getDefaultConfig() );
    return new Context(config);
  }

  private static getDefaultConfig():GorConfig {
    return {
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

  private static getDefaultResolver( dbName:string ):Promise<DataStore> {
    return MongoDbDataStore.create( { url: 'mongodb://localhost:27017', dbName } );
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
      return this.filterTypes[ SchemaBuilder.getFilterName(fieldType as string) ];
    } else if( _.isString( filterType ) ) {
      return this.filterTypes[ filterType ];
    } else return filterType;
  }


}
