import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express';
import { Config, DomainConfiguration, DomainDefinition, Runtime } from 'graph-on-rails';
import _ from 'lodash';


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
