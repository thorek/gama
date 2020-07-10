import fs from 'fs';
import { GraphQLSchema } from 'graphql';
import _ from 'lodash';
import path from 'path';
import YAML from 'yaml';

import { EntityBuilder } from '../builder/entity-builder';
import { EnumBuilder } from '../builder/enum-builder';
import { EnumConfigBuilder } from '../builder/enum-config-builder';
import { SchemaBuilder } from '../builder/schema-builder';
import { ConfigEntity } from '../entities/config-entity';
import { Context } from './context';


type DefinitionType = {
  enum:{[name:string]:{}}
  entity:{[name:string]:{}}
}

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
    this._schema = this.createSchema( this.context );
    return this._schema;
  }

  /**
   *
   */
  private builders():SchemaBuilder[] {
    if( this._builders ) return this._builders;
    const configTypeBuilders = this.getConfigTypeBuilder();
    const customBuilders = this.getCustomBuilders();
    const scalarFilterTypeBuilders = this.context.dataStore.getScalarFilterTypes();
    this._builders = _.compact([
      this.config.metaDataBuilder,
      ...scalarFilterTypeBuilders,
      ...configTypeBuilders,
      ...customBuilders
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
    const configs = this.getConfigDefinitions();
    const builder:SchemaBuilder[] = _.compact( _.map( configs.entity,
      (config, name) => this.createEntityBuilder( name, config )) );
    builder.push( ... _.compact( _.map( configs.enum,
    (config, name) => this.createEnumBuilder( name, config )) ) )
    return builder;
  }


  /**
   *
   */
  private getConfigDefinitions():DefinitionType {
    const configs:DefinitionType = { enum: {}, entity: {} };
    _.forEach( this.config.configFolder, folder => {
      const files = this.getConfigFiles( folder );
      _.forEach( files, file => this.parseConfigFile( configs, folder, file ) );
    });
    return _.merge( configs, this.config.domainConfiguration );
  }

  /**
   *
   */
  private getConfigFiles( folder:string ):string[] {
    try {
      return _.filter( fs.readdirSync( folder ), file => this.isConfigFile(file) );
    } catch (error) {
      console.error( `cannot read files from folder '${folder}'`, error );
      return [];
    }
  }

  /**
   *
   */
  private isConfigFile( file:string ):boolean {
    const extension = _.toLower( path.extname( file ));
    return _.includes( ['.yaml', '.yml'], extension );
  }

  /**
   *
   */
  private parseConfigFile( configs:any, folder:string, file:string ):void {
    try {
      file = path.join( folder, file );
      const content = fs.readFileSync( file).toString();
      const config = YAML.parse(content);
      _.merge( configs, config );
    } catch ( error ){
      console.warn( `Error parsing file [${file}]:`, error );
    }
  }

  /**
   *
   */
  private createEntityBuilder( name:string, config:any ):undefined|EntityBuilder {
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
  private createEnumBuilder( name:string, config:any ):undefined|EnumBuilder{
    try {
      return EnumConfigBuilder.create( name, config );
    } catch (error) {
      console.log( `Error building enum [${name}]`, error );
    }
  }

  /**
   *
   */
  createSchema(context:Context):GraphQLSchema {
    context.graphx.init();
    _.forEach( this.builders(), type => type.init( context ) );
    _.forEach( this.builders(), type => type.createTypes() );
    _.forEach(
      _.filter( this.builders(), builder => (builder instanceof EntityBuilder)) as EntityBuilder[],
        builder => builder.createUnionType() );
    _.forEach( this.builders(), type => type.extendTypes() );

    if( _.isFunction( context.extendSchema ) ) context.extendSchema( context );
    const schema = context.graphx.generate();
    return schema;
  }
}
