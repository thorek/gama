import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express';
import express from 'express';
import depthLimit from 'graphql-depth-limit';
import _ from 'lodash';

import { Context, GorConfig } from './context';
import { SchemaFactory } from './schema-factory';
import { GraphQLSchema } from 'graphql';


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
  static async create( name:string = 'default', config?:GorConfig ):Promise<Runtime>{
    const context = await Context.create( name, config );
    return new Runtime( context, SchemaFactory.create( context ) );
  }

  /**
	 *
	 */
  async server( config:ApolloServerExpressConfig = {} ):Promise<ApolloServer> {
    const customContextFn = config.context;
    config.context = (contextExpress:any) => {
      const apolloContext = _.isFunction( customContextFn ) ? customContextFn(contextExpress) : {};
      _.set( apolloContext, 'context', this.context );
      return apolloContext;
    }
    config.schema = await this.schemaFactory.schema();
    _.defaultsDeep( config, { validationRules: [depthLimit(7)], context: { Context: this.context } } );
    return new ApolloServer( config );
  }

  schema():Promise<GraphQLSchema>{
    return this.schemaFactory.schema();
  }
}
