import { GraphQLSchema } from 'graphql';
import _ from 'lodash';

import { Runtime, Config } from './runtime';
import { DomainConfiguration } from './domain-definition';
import { SchemaFactory } from './schema-factory';


/**
 *
 */
export class RuntimeOld {

  //
  //
  private constructor(
    public readonly runtime:Runtime,
    private schemaFactory:SchemaFactory
  ){}

  /**
   *
   */
  static async create( config?:Config|DomainConfiguration|string ):Promise<RuntimeOld> {
    if( _.isString( config ) ) config = { domainDefinition: config };
    if( ! _.has( config, 'domainDefinition') ) config = { domainDefinition: config as DomainConfiguration };
    const context = await Runtime.create( config as Config );
    return new RuntimeOld( context, SchemaFactory.create( context ) );
  }


}
