import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { SimpleLogin } from 'extras/simple-login';
import { DomainDefinition, Runtime } from 'graph-on-rails';
import depthLimit from 'graphql-depth-limit';
import { createServer } from 'http';
import _ from 'lodash';
import path from 'path';



const docDomainDefinition = ( _:any ) => {
  return `${__dirname}/config-types/doc`;
}

const loginDomainDefinition = ( config:ApolloServerExpressConfig ) => {
  const domainDefinition = new DomainDefinition( `${__dirname}/config-types/d2prom` );
  SimpleLogin.addToDefinition( domainDefinition, config );
}

const addRuntime = async ( config:ApolloServerExpressConfig ) => {
  const domainDefinition = docDomainDefinition( config );
  const runtime = await Runtime.create( domainDefinition );
  config.schema = runtime.schema;
  const customContextFn = config.context;
  config.context = (contextExpress:any) => {
    const apolloContext = _.isFunction( customContextFn ) ? customContextFn(contextExpress) : {};
    return _.set( apolloContext, 'runtime', runtime );
  }
}

const apollo = async ( app:Express.Application ):Promise<ApolloServer> => {
  const config:ApolloServerExpressConfig = {};
  await addRuntime( config );
  _.defaultsDeep( config, { validationRules: [depthLimit(7)] } );
  return new ApolloServer( config );
}

(async () => {
  const app = express();
  app.use('*', cors());
  app.use(compression());
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

  const server = await apollo( app );
  server.applyMiddleware({ app, path: '/graphql' });

  const httpServer = createServer( app );

  httpServer.listen(
    { port: 3000 },
    () => { console.log(`\n🚀 GraphQL is now running on http://localhost:3000/graphql\n`) }
  );

})();

