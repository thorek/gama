import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express';
import { GraphQLSchema } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import _ from 'lodash';

import { Context, Config } from './context';
import { DomainConfiguration } from './domain-definition';
import { SchemaFactory } from './schema-factory';


/**
 *
 */
export class Runtime {

  //
  //
  private constructor(
    public readonly context:Context,
    private schemaFactory:SchemaFactory
  ){}

  /**
   *
   */
  static async create( config?:Config|DomainConfiguration|string ):Promise<Runtime> {
    if( _.isString( config ) ) config = { domainDefinition: config };
    if( ! _.has( config, 'domainDefinition') ) config = { domainDefinition: config as DomainConfiguration };
    const context = await Context.create( config as Config );
    return new Runtime( context, SchemaFactory.create( context ) );
  }

  /**
	 *
	 */
  async server( config:ApolloServerExpressConfig = {} ):Promise<ApolloServer> {
    const customContextFn = config.context;
    config.context = (contextExpress:any) => {
      const apolloContext = _.isFunction( customContextFn ) ? customContextFn(contextExpress) : {};
      return _.set( apolloContext, 'context', this.context );
    }
    config.schema = await this.schemaFactory.schema();
    _.defaultsDeep( config, { validationRules: [depthLimit(7)] } );
    return new ApolloServer( config );
  }

  schema():Promise<GraphQLSchema>{
    return this.schemaFactory.schema();
  }
}
