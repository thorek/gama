import { ApolloServerExpressConfig } from 'apollo-server-express';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { Apollo, DomainConfiguration, DomainDefinition, Entity } from 'graph-on-rails';
import depthLimit from 'graphql-depth-limit';
import { createServer } from 'http';
import path from 'path';

import { login } from './domain-definition';


class MyEntity extends Entity {

  protected getName(): string {
    return "house";
  }

  getCreateMutation(){ return 'buildHouse' }


}

console.log('Start Express');

(async () => {
  const app = express();
  app.use('*', cors());
  app.use(compression());

  const uploadRootDir = path.join(__dirname, 'uploads');
  app.use('/uploads', express.static(uploadRootDir));

  const apolloConfig:ApolloServerExpressConfig = { validationRules: [depthLimit(7)] };

  const domainConfiguration:DomainConfiguration = {
    enum: {
      CarModel: [
        'Mercedes',
        'Volkswagen',
        'BMW'
      ]
    },
    entity: {
      Car: {
        typeName: 'Vehicle',
        attributes: {
          model: 'CarModel!',
          color: {
            type: 'string',
            validation: {
              presence: true,
              length: {
                minimum: 2
              }

            }
          },
          licence: 'string',
          mileage: 'int'
        }
      }
    }
  };

  const domainDefinition = new DomainDefinition( domainConfiguration );
  domainDefinition.entities.push( new MyEntity() );

  const server = await Apollo.server( apolloConfig, { domainDefinition} );
  server.applyMiddleware({ app, path: '/graphql' });

  const httpServer = createServer( app );
  httpServer.listen(
    { port: 3000 },
    () => console.log(`
      🚀 GraphQL is now running on http://localhost:3000/graphql
      Uploads in ${uploadRootDir}`)
  );

})();

