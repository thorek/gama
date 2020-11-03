import {
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLString,
  Kind,
} from 'graphql';
import _ from 'lodash';

import { EntityBuilder } from '../builder/entity-builder';
import { EnumBuilder, EnumConfigBuilder } from '../builder/enum-builder';
import { MutationBuilder, MutationConfigBuilder } from '../builder/mutation-builder';
import { QueryBuilder, QueryConfigBuilder } from '../builder/query-builder';
import { SchemaBuilder } from '../builder/schema-builder';
import { ConfigEntity } from '../entities/config-entity';
import { EntityConfig, EnumConfig, MutationConfigFn, QueryConfigFn } from './domain-configuration';
import { Runtime } from './runtime';


//
//
export class SchemaFactory {

  private _builders?:SchemaBuilder[];
  private _schema?:GraphQLSchema;

  get config() { return this.runtime.config }
  get graphx() { return this.runtime.graphx }

  //
  //
  private constructor( private runtime:Runtime ){}

  static create( runtime:Runtime ):SchemaFactory {
    return new SchemaFactory( runtime );
  }

  async schema():Promise<GraphQLSchema> {
    if( this._schema ) return this._schema;
    this._schema = await this.createSchema();
    return this._schema;
  }

  private builders():SchemaBuilder[] {
    if( this._builders ) return this._builders;
    this._builders = _.compact([
      this.config.metaDataBuilder,
      ... this.runtime.dataStore.getScalarFilterTypes(),
      ... this.getConfigTypeBuilder(),
      ... this.getCustomBuilders()
    ]);
    return this._builders;
  }

  private getCustomBuilders():SchemaBuilder[] {
    const domainDefinition = this.runtime.domainDefinition;
    return _.compact( _.flatten( _.concat(
      _.get(this.config, 'schemaBuilder', [] ),
      _.map( domainDefinition.entities, entity => new EntityBuilder( entity )),
      domainDefinition.enums
    )));
  }

  private getConfigTypeBuilder():SchemaBuilder[] {
    const domainDefinition = this.runtime.domainDefinition;
    if( ! domainDefinition ) return [];
    const configuration = domainDefinition.getConfiguration();
    const builder:SchemaBuilder[] = _.compact( _.map( configuration.entity,
      (config, name) => this.createEntityBuilder( name, config )) );
    builder.push( ... _.compact( _.map( configuration.enum,
      (config, name) => this.createEnumBuilder( name, config ) ) ) );
    builder.push( ... _.compact( _.map( configuration.query,
      (config, name) => this.createQueryBuilder( name, config ) ) ) );
    builder.push( ... _.compact( _.map( configuration.mutation,
      (config, name) => this.createMutationBuilder( name, config ) ) ) );

    return builder;
  }

  private createEntityBuilder( name:string, config:EntityConfig ):undefined|EntityBuilder {
    try {
      const entity = ConfigEntity.create(name, config );
      return new EntityBuilder( entity );
    } catch (error) {
      console.log( `Error building entity [${name}]`, error );
    }
  }

  private createEnumBuilder( name:string, config:EnumConfig ):undefined|EnumBuilder{
    try {
      return EnumConfigBuilder.create( name, config );
    } catch (error) {
      console.log( `Error building enum [${name}]`, error );
    }
  }

  private createQueryBuilder( name:string, config:QueryConfigFn ):undefined|QueryBuilder{
    try {
      return QueryConfigBuilder.create( name, config );
    } catch (error) {
      console.log( `Error building query [${name}]`, error );
    }
  }

  private createMutationBuilder( name:string, config:MutationConfigFn ):undefined|MutationBuilder{
    try {
      return MutationConfigBuilder.create( name, config );
    } catch (error) {
      console.log( `Error building mutation [${name}]`, error );
    }
  }

  async createSchema():Promise<GraphQLSchema> {
    this.graphx.init( this.runtime );
    this.createScalars();
    this.createCommonTypes();
    await this.buildFromBuilders();
    await this.extendSchema();
    const schema = this.graphx.generate();
    return schema;
  }

  private async buildFromBuilders(){
    _.forEach( this.builders(), type => type.init( this.runtime ) );
    for( const builder of this.builders() ) await Promise.resolve( builder.build() );
    await this.extendTypeBuilders();
  }

  private async extendSchema(){
    const extendSchemaFn = this.runtime.domainDefinition.extendSchema;
    if( _.isFunction( extendSchemaFn ) ) extendSchemaFn( this.runtime );
  }

  private async extendTypeBuilders(){
    const entityBuilders = _.filter( this.builders(), builder => builder instanceof EntityBuilder ) as EntityBuilder[];
    const enumBuilders = _.filter( this.builders(), builder => builder instanceof EnumBuilder ) as EnumBuilder[];
    _.forEach( entityBuilders, builder => builder.createUnionType() );
    _.forEach( entityBuilders, builder => builder.extendTypes() );
    _.forEach( enumBuilders, builder => builder.extendTypes() );
    for( const entity of _.values( this.runtime.entities) ) {
      const extendFn = entity.extendEntity();
      if( _.isFunction(extendFn) ) await Promise.resolve( extendFn( this.runtime ) );
    }
  }

  private createScalars():void {
    this.graphx.type( 'Date', {
      name: 'Date',
      from: GraphQLScalarType,
      parseValue: (value:any) => new Date(value),
      parseLiteral: (ast:any) => ast.kind === Kind.STRING ? new Date(ast.value) : null,
      serialize: (value:any) => value instanceof Date ? value.toJSON() : `[${value}]`
    });

    this.graphx.type( 'JSON', {
      name: 'JSON',
      from: GraphQLScalarType,
      parseValue: (value:any) => value,
      serialize: (value:any) => value
    });

  }

  private createCommonTypes(){
    this.createValidationViolationType();
    this.createEntityPagingType();
    this.createFileType();
    this.createEntityStatsType();
  }

  private createValidationViolationType():void {
    this.graphx.type('ValidationViolation', {
      name: 'ValidationViolation',
      fields: () => ({
        attribute: { type: GraphQLString },
        message: { type: new GraphQLNonNull( GraphQLString ) }
      })
    });
  }

  private createEntityPagingType():void {
    this.graphx.type('EntityPaging', {
      name: 'EntityPaging',
      description: 'use this to get a certain fraction of a (large) result set',
      from: GraphQLInputObjectType,
      fields: () => ({
        page: { type: GraphQLNonNull( GraphQLInt ), description: 'page of set, starts with 0' },
        size: { type: new GraphQLNonNull( GraphQLInt ), description: 'number of items in page, 0 means no limit' }
      })
    });
  }

  private createFileType( ):void {
    this.graphx.type('File', {
      name: 'File',
      fields: () => ({
        filename: { type: GraphQLNonNull(GraphQLString) },
        mimetype: { type: GraphQLNonNull(GraphQLString) },
        encoding: { type: GraphQLNonNull(GraphQLString) }
      })
    });
  }

  private createEntityStatsType( ):void {
    this.graphx.type('EntityStats', {
      name: 'EntityStats',
      fields: () => ({
        count: { type: GraphQLNonNull(GraphQLInt) },
        createdFirst: { type: this.graphx.type('Date') },
        createdLast: { type: this.graphx.type('Date') },
        updatedLast: { type: this.graphx.type('Date') }
      })
    });
  }

}
