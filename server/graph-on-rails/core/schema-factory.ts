import { GraphQLScalarType, GraphQLSchema, Kind } from 'graphql';
import _ from 'lodash';

import { EntityBuilder } from '../builder/entity-builder';
import { EnumBuilder, EnumConfig, EnumConfigBuilder } from '../builder/enum-builder';
import { MutationBuilder, MutationConfig, MutationConfigBuilder } from '../builder/mutation-builder';
import { QueryBuilder, QueryConfig, QueryConfigBuilder } from '../builder/query-builder';
import { SchemaBuilder } from '../builder/schema-builder';
import { ConfigEntity, EntityConfig } from '../entities/config-entity';
import { Context } from './context';


//
//
export class SchemaFactory {

  private _builders?:SchemaBuilder[];
  private _schema?:GraphQLSchema;

  get config() { return this.context.config }

  //
  //
  private constructor( private context:Context ){}

  /**
   *
   */
  static create( context:Context ):SchemaFactory {
    return new SchemaFactory( context );
  }

  /**
   *
   */
  async schema():Promise<GraphQLSchema> {
    if( this._schema ) return this._schema;
    this._schema = await this.createSchema( this.context );
    return this._schema;
  }

  /**
   *
   */
  private builders():SchemaBuilder[] {
    if( this._builders ) return this._builders;
    this._builders = _.compact([
      this.config.metaDataBuilder,
      ... this.context.dataStore.getScalarFilterTypes(),
      ... this.getConfigTypeBuilder(),
      ... this.getCustomBuilders()
    ]);
    return this._builders;
  }

  /**
   *
   */
  private getCustomBuilders():SchemaBuilder[] {
    return _.compact( _.flatten( _.concat(
      _.get(this.config, 'schemaBuilder', [] ),
      _.map( this.config.entities, entity => new EntityBuilder( entity ))
    )));
  }

  /**
   *
   */
  private getConfigTypeBuilder():SchemaBuilder[] {
    const domainConfiguration = this.context.config.domainConfiguration;
    if( ! domainConfiguration ) return [];
    const configuration = domainConfiguration.getConfiguration();
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
  async createSchema(context:Context):Promise<GraphQLSchema> {
    context.graphx.init();
    this.createScalars( context );
    await this.buildFromBuilders( context );
    if( _.isFunction( context.extendSchema ) ) context.extendSchema( context );
    const schema = context.graphx.generate();
    return schema;
  }

  private async buildFromBuilders( context:Context ){
    _.forEach( this.builders(), type => type.init( context ) );
    _.forEach( this.builders(), type => type.build() );
    await this.extendEntityBuilders( context );
  }

  private async extendEntityBuilders( context:Context ){
    const entityBuilders = _.filter( this.builders(), builder => builder instanceof EntityBuilder ) as EntityBuilder[];
    _.forEach( entityBuilders, builder => builder.createUnionType() );
    _.forEach( entityBuilders, builder => builder.extendTypes() );
    for( const entity of _.values( context.entities) ) {
      const extendFn = entity.extendEntity();
      if( _.isFunction(extendFn) ) await Promise.resolve( extendFn( context ) );
    }
  }

  private createScalars( context:Context ):void {
    context.graphx.type( 'Date', {
      name: 'Date',
      from: GraphQLScalarType,
      parseValue: (value:any) => new Date(value),
      parseLiteral: (ast:any) => ast.kind === Kind.STRING ? new Date(ast.value) : null,
      serialize: (value:any) => value instanceof Date ? value.toJSON() : `[${value}]`
    });
  }

}
