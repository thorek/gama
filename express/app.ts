import { ApolloServerExpressConfig } from 'apollo-server-express';
import compression from 'compression';
import cors from 'cors';
import { login } from 'domain-definition';
import express from 'express';
import { Apollo } from 'graph-on-rails';
import depthLimit from 'graphql-depth-limit';
import { createServer } from 'http';
import path from 'path';



(async () => {
  const app = express();
  app.use('*', cors());
  app.use(compression());
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

  const config:ApolloServerExpressConfig = { validationRules: [depthLimit(7)] };
  const domainDefinition = login( config );
  const server = await Apollo.server( config, domainDefinition );
  server.applyMiddleware({ app, path: '/graphql' });

  const httpServer = createServer( app );
  httpServer.listen(
    { port: 3000 },
    () => { console.log(`\n🚀 GraphQL is now running on http://localhost:3000/graphql\n`) }
  );

})();

