import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express';
import depthLimit from 'graphql-depth-limit';
import _ from 'lodash';

import { Context, GorConfig } from './context';
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
  static async create( name:string = 'default', config?:GorConfig ):Promise<Runtime>{
    const context = await Context.create( name, config );
    return new Runtime( context, SchemaFactory.create( context ) );
  }

  /**
	 *
	 */
  async server( config:ApolloServerExpressConfig = {} ):Promise<ApolloServer> {
    config.schema = await this.schemaFactory.schema();
    _.defaultsDeep( config, { validationRules: [depthLimit(7)], context: { Context: this.context } } );
    return new ApolloServer( config );
  }

}
