import YAML from 'yaml';
import { AuthenticationError } from 'apollo-server-express';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import _ from 'lodash';

import { Runtime } from './graph-on-rails/core/runtime';
import { ResolverContext } from './graph-on-rails/core/resolver-context';
import { Entity } from './graph-on-rails/entities/entity';
import { seed } from 'faker';

(async () => {

  const app = express();
  app.use('*', cors());
  app.use(compression());

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
  const configFolder = [`${__dirname}/config-types/d2prom`];
  const runtime = await Runtime.create( 'D2PROM', {configFolder, domainConfiguration: {
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
  }});

  const users:{[token:string]:any} = {
    admin: { id: 100, username: 'Admin', roles: ['admin'], clientId: '5ec3b745d3a47f8284414125' },
    thorek: { id: 101, username: 'Thorek', roles: ['dsb','user'], clientId: '5ec42368f0d6ec10681dec79'  },
    guest: { id: 102, username: 'Guest', roles: ['guest'] }
  };

  const getUser = (token?:string) => {
    if( ! token ) return undefined;
    const user = users[token];
    if( user ) return user;
    throw new AuthenticationError( `Token '${token}' cannot be resolved to a valid user.`);
  }

  const context = (contextExpress: {req: express.Request }) => {
    const token:string|undefined = contextExpress.req.headers.authorization;
    return { user: getUser(token), context: runtime.context };
  }

  const server = await runtime.server({context});
  server.applyMiddleware({ app, path: '/graphql' });
  const httpServer = createServer(app);

  httpServer.listen(
    { port: 3000 },
    (): void => { console.log(`\n🚀 GraphQL is now running on http://localhost:3000/graphql\n`) }
  );

})();

