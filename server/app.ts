import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import _ from 'lodash';
import path from 'path';
import { AppServer } from './app-server';
import { DocServer } from './doc-server';


(async () => {

  const app = express();
  app.use('*', cors());
  app.use(compression());
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

  const server = await AppServer.create();

  server.applyMiddleware({ app, path: '/graphql' });
  const httpServer = createServer(app);

  httpServer.listen(
    { port: 3000 },
    () => { console.log(`\n🚀 GraphQL is now running on http://localhost:3000/graphql\n`) }
  );

})();

