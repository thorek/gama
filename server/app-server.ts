import _ from 'lodash';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { Runtime } from './graph-on-rails/core/runtime';
import { Entity } from './graph-on-rails/entities/entity';
import { DomainConfiguration } from './graph-on-rails/core/domain-configuration';

import { SimpleLogin } from './extras/simple-login';

export class AppServer {

  static async create():Promise<ApolloServer> {

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

    const login = new SimpleLogin();
    const apolloContext = (contextExpress:{req:express.Request }) => {
      const token:string|undefined = contextExpress.req.headers.authorization;
      return { user: login.getUser(token), context: runtime.context };
    }

    const domainConfiguration = new DomainConfiguration( [`${__dirname}/config-types/d2prom`] );
    domainConfiguration.add({
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
    });
    domainConfiguration.add( login.getConfiguration() );

    const runtime = await Runtime.create( 'GAMA', {domainConfiguration});
    return runtime.server({context: apolloContext});
  }
}
