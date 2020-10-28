import { GraphQLScalarType, GraphQLSchema, Kind } from 'graphql';
import _ from 'lodash';

import { EntityBuilder } from '../builder/entity-builder';
import { EnumBuilder, EnumConfig, EnumConfigBuilder } from '../builder/enum-builder';
import { MutationBuilder, MutationConfig, MutationConfigBuilder } from '../builder/mutation-builder';
import { QueryBuilder, QueryConfig, QueryConfigBuilder } from '../builder/query-builder';
import { SchemaBuilder } from '../builder/schema-builder';
import { ConfigEntity, EntityConfig } from '../entities/config-entity';
import { Runtime } from './runtime';


//
//
export class SchemaFactory {

  private _builders?:SchemaBuilder[];
  private _schema?:GraphQLSchema;

  get config() { return this.runtime.config }

  //
  //
  private constructor( private runtime:Runtime ){}

  /**
   *
   */
  static create( runtime:Runtime ):SchemaFactory {
    return new SchemaFactory( runtime );
  }

  /**
   *
   */
  async schema():Promise<GraphQLSchema> {
    if( this._schema ) return this._schema;
    this._schema = await this.createSchema( this.runtime );
    return this._schema;
  }

  /**
   *
   */
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

  /**
   *
   */
  private getCustomBuilders():SchemaBuilder[] {
    const domainDefinition = this.runtime.domainDefinition;
    return _.compact( _.flatten( _.concat(
      _.get(this.config, 'schemaBuilder', [] ),
      _.map( domainDefinition.entities, entity => new EntityBuilder( entity )),
      domainDefinition.enums
    )));
  }

  /**
   *
   */
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


  /**
   *
   */
  private createEntityBuilder( name:string, config:EntityConfig ):undefined|EntityBuilder {
    try {
      const entity = ConfigEntity.create(name, config );
      return new EntityBuilder( entity );
    } catch (error) {
      console.log( `Error building entity [${name}]`, error );
    }
  }

  /**
   *
   */
  private createEnumBuilder( name:string, config:EnumConfig ):undefined|EnumBuilder{
    try {
      return EnumConfigBuilder.create( name, config );
    } catch (error) {
      console.log( `Error building enum [${name}]`, error );
    }
  }

  /**
   *
   */
  private createQueryBuilder( name:string, config:QueryConfig ):undefined|QueryBuilder{
    try {
      return QueryConfigBuilder.create( name, config );
    } catch (error) {
      console.log( `Error building query [${name}]`, error );
    }
  }

  /**
   *
   */
  private createMutationBuilder( name:string, config:MutationConfig ):undefined|MutationBuilder{
    try {
      return MutationConfigBuilder.create( name, config );
    } catch (error) {
      console.log( `Error building mutation [${name}]`, error );
    }
  }

  /**
   *
   */
  async createSchema(runtime:Runtime):Promise<GraphQLSchema> {
    runtime.graphx.init();
    this.createScalars( runtime );
    await this.buildFromBuilders( runtime );
    await this.extendSchema( runtime );
    const schema = runtime.graphx.generate();
    return schema;
  }

  private async buildFromBuilders( runtime:Runtime ){
    _.forEach( this.builders(), type => type.init( runtime ) );
    _.forEach( this.builders(), type => type.build() );
    await this.extendTypeBuilders( runtime );
  }

  private async extendSchema( runtime:Runtime ){
    const extendSchemaFn = runtime.domainDefinition.extendSchema;
    if( _.isFunction( extendSchemaFn ) ) extendSchemaFn( runtime );
  }

  private async extendTypeBuilders( runtime:Runtime ){
    const entityBuilders = _.filter( this.builders(), builder => builder instanceof EntityBuilder ) as EntityBuilder[];
    const enumBuilders = _.filter( this.builders(), builder => builder instanceof EnumBuilder ) as EnumBuilder[];
    _.forEach( entityBuilders, builder => builder.createUnionType() );
    _.forEach( entityBuilders, builder => builder.extendTypes() );
    _.forEach( enumBuilders, builder => builder.extendTypes() );
    for( const entity of _.values( runtime.entities) ) {
      const extendFn = entity.extendEntity();
      if( _.isFunction(extendFn) ) await Promise.resolve( extendFn( runtime ) );
    }
  }

  private createScalars( runtime:Runtime ):void {
    runtime.graphx.type( 'Date', {
      name: 'Date',
      from: GraphQLScalarType,
      parseValue: (value:any) => new Date(value),
      parseLiteral: (ast:any) => ast.kind === Kind.STRING ? new Date(ast.value) : null,
      serialize: (value:any) => value instanceof Date ? value.toJSON() : `[${value}]`
    });
  }

}
