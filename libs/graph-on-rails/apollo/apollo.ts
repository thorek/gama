import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express';
import _ from 'lodash';

import { DomainDefinition } from '../core/domain-definition';
import { DomainConfiguration } from '../core/domain-configuration';
import { GamaConfig, Runtime } from '../core/runtime';

/**
 * I'd love to have this outside of this (library) package - alas Apollo checks somehow that the same constructor
 * is used - and when I use Apollo in the server/express package he is confused
 */
export class Apollo {


  static async server( apolloConfig:ApolloServerExpressConfig, gamaConfig:GamaConfig|DomainDefinition|DomainConfiguration|string ):Promise<ApolloServer> {
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
