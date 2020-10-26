import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import _ from 'lodash';

import { SimpleLogin } from './extras/simple-login';
import { DomainDefinition } from './graph-on-rails/core/domain-definition';
import { Runtime } from './graph-on-rails/core/runtime';
import { Entity } from './graph-on-rails/entities/entity';

export async function create():Promise<ApolloServer> {

  const domainDefinition = new DomainDefinition( `${__dirname}/config-types/d2prom` );

  const login = new SimpleLogin();
  domainDefinition.add( login.getConfiguration() );
  const context = (contextExpress:{req:express.Request }) => {
    const token:string|undefined = contextExpress.req.headers.authorization;
    return { user: login.getUser(token) };
  }

  domainDefinition.add({
    entity: {
      RiskAssessment: {
        attributes: {
          priority: {
            type: 'Priority',
            calculate: ( root:any ) => {
              const probability = _.get( root, 'probability');
              const damage = _.get( root, 'damage');
              const result = probability * damage;
              if( result <= 3 ) return 10;
              if( result <= 8 ) return 20;
              return 30;
            }
          }
        }
      },
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

  const runtime = await Runtime.create( { domainDefinition } );
  return runtime.server({context});
}


export async function docServer():Promise<ApolloServer> {
  const domainDefinition = new DomainDefinition( [`${__dirname}/config-types/doc`] );
  const runtime = await Runtime.create({ domainDefinition });
  return runtime.server();
}
