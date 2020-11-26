import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import path from 'path';
import expressJwt from 'express-jwt';
import { gama } from './gama-app';


(async () => {
  const app = express();
  app.use('*', cors());
  app.use(compression());

  const uploadRootDir = path.join(__dirname, 'uploads');
  app.use('/uploads', express.static(uploadRootDir));

  app.use( expressJwt({ secret: "My$3cr3Tf0r$1gn1n9", algorithms: ["HS256"], credentialsRequired: false } ) );

  const server = await gama();
  server.applyMiddleware({ app, path: '/graphql' });

  const httpServer = createServer( app );
  httpServer.listen(
    { port: 3000 },
    () => console.log(`
      🚀 GraphQL is now running on http://localhost:3000/graphql
      Uploads in ${uploadRootDir}`)
  );

})();

