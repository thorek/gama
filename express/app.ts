import { ApolloServerExpressConfig } from 'apollo-server-express';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { DomainDefinition, GamaConfig, GamaServer } from 'graph-on-rails';
import depthLimit from 'graphql-depth-limit';
import { createServer } from 'http';
import path from 'path';

import { domainConfiguration } from './domain-configuration';

const domainConfigurationFolder = './domain-configuration';
const domainDefinition:DomainDefinition = new DomainDefinition( domainConfigurationFolder );
domainDefinition.add( domainConfiguration );
const gamaConfig:GamaConfig = { domainDefinition };

const tutorial = './tutorial/08';

(async () => {
  const app = express();
  app.use('*', cors());
  app.use(compression());

  const uploadRootDir = path.join(__dirname, 'uploads');
  app.use('/uploads', express.static(uploadRootDir));

  const apolloConfig:ApolloServerExpressConfig = { validationRules: [depthLimit(7)] };

  const server = await GamaServer.create( apolloConfig, tutorial );
  server.applyMiddleware({ app, path: '/graphql' });

  const httpServer = createServer( app );
  httpServer.listen(
    { port: 3000 },
    () => console.log(`
      🚀 GraphQL is now running on http://localhost:3000/graphql
      Uploads in ${uploadRootDir}`)
  );

})();

