import { ApolloServerExpressConfig } from 'apollo-server-express';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { Apollo } from 'graph-on-rails';
import depthLimit from 'graphql-depth-limit';
import { createServer } from 'http';
import path from 'path';

import { login } from './domain-definition';

console.log('Start Express');

(async () => {
  const app = express();
  app.use('*', cors());
  app.use(compression());
  const uploadRootDir = path.join(__dirname, 'uploads');
  app.use('/uploads', express.static(uploadRootDir));

  const apolloConfig:ApolloServerExpressConfig = { validationRules: [depthLimit(7)] };
  const domainDefinition = login( apolloConfig );
  const gamaConfig = { domainDefinition: {
      entity: {
        User: {
          attributes: {
            username: 'string!',
            roles: '[string]'
          },
          seeds: {
            admin: {
              username: 'admin',
              roles: ['user', 'admin']
            },
            regular: {
              username: 'regular',
              roles: ['user']
            }
          }
        }
      }
    }, uploadRootDir };
  const server = await Apollo.server( apolloConfig, gamaConfig );
  server.applyMiddleware({ app, path: '/graphql' });

  const httpServer = createServer( app );
  httpServer.listen(
    { port: 3000 },
    () => console.log(`
      🚀 GraphQL is now running on http://localhost:3000/graphql
      Uploads in ${uploadRootDir}`)
  );

})();

