import { ApolloServerExpressConfig } from 'apollo-server-express';
import compression from 'compression';
import cors from 'cors';
import { defaultValue1, defaultValue2, filterType1, list1 } from './examples/attribute-configuration';
import express from 'express';
import { GamaServer } from 'graph-on-rails';
import depthLimit from 'graphql-depth-limit';
import { createServer } from 'http';
import path from 'path';


(async () => {
  const app = express();
  app.use('*', cors());
  app.use(compression());

  const uploadRootDir = path.join(__dirname, 'uploads');
  app.use('/uploads', express.static(uploadRootDir));

  const apolloConfig:ApolloServerExpressConfig = { validationRules: [depthLimit(7)] };

  const server = await GamaServer.create( apolloConfig, filterType1 );
  server.applyMiddleware({ app, path: '/graphql' });

  const httpServer = createServer( app );
  httpServer.listen(
    { port: 3000 },
    () => console.log(`
      🚀 GraphQL is now running on http://localhost:3000/graphql
      Uploads in ${uploadRootDir}`)
  );

})();

