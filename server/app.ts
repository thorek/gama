import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import _ from 'lodash';
import path from 'path';

import { SimpleLogin } from './extras/simple-login';
import { Runtime } from './graph-on-rails/core/runtime';
import { Entity } from './graph-on-rails/entities/entity';

(async () => {

  const app = express();
  app.use('*', cors());
  app.use(compression());
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

  const virtualResolver = _.set( {},
    'RiskAssessment', {
      priority: (root:any ) => {
        const probability = _.get( root, 'probability');
        const damage = _.get( root, 'damage');
        const result = probability * damage;
        if( result <= 3 ) return 10;
        if( result <= 8 ) return 20;
        return 30;
      }
    }
  );
  const domainConfiguration = {
    locale: 'de',
    entity: {
      ProcessingActivity: {
        seeds: {
          Faker: {
            Organisation: async (evalContext:any) => {
              const entity:Entity = evalContext.context.entities['Organisation'];
              const items = await entity.findByAttribute({});
              const id = _.sample( items )?.id;
              _.set(evalContext.seed, 'organisationId', id );
              return id;
            },
            OrganisationalUnit: async (evalContext:any) => {
              const entity:Entity = evalContext.context.entities['OrganisationalUnit'];
              const items = await entity.findByAttribute( {organisationId: evalContext.seed.organisationId } );
              const ids = _.map( items, item => item.id );
              return _.sampleSize( ids, _.random( 1, 3) );
            }
          }
        }
      }
    }
  }

  const login = new SimpleLogin();
  _.merge( domainConfiguration, login.getConfiguration() );

  const context = (contextExpress:{req:express.Request }) => {
    const token:string|undefined = contextExpress.req.headers.authorization;
    return { user: login.getUser(token), context: runtime.context };
  }

  const configFolder = [`${__dirname}/config-types/policentransfer`];
  const runtime = await Runtime.create( 'GAMA', {configFolder});

  const server = await runtime.server({context});
  server.applyMiddleware({ app, path: '/graphql' });
  const httpServer = createServer(app);

  httpServer.listen(
    { port: 3000 },
    () => { console.log(`\n🚀 GraphQL is now running on http://localhost:3000/graphql\n`) }
  );

})();

