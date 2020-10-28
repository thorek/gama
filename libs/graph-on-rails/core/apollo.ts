import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express';
import _ from 'lodash';

import { DomainConfiguration, DomainDefinition } from './domain-definition';
import { Config, Runtime } from './runtime';

export class Apollo {


  static async server( apolloConfig:ApolloServerExpressConfig, gamaConfig:Config|DomainDefinition|DomainConfiguration|string ):Promise<ApolloServer> {
    const runtime = await Runtime.create( gamaConfig );
    apolloConfig.schema = runtime.schema;
    const customContextFn = apolloConfig.context;
    apolloConfig.context = (contextExpress:any) => {
      const apolloContext = _.isFunction( customContextFn ) ? customContextFn(contextExpress) : {};
      return _.set( apolloContext, 'runtime', runtime );
    }
    return new ApolloServer( apolloConfig );
  }



}
