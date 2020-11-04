import { ApolloServerExpressConfig } from 'apollo-server-express';
import express from 'express';
import { DomainDefinition, Entity, DomainConfiguration } from 'graph-on-rails';
import _ from 'lodash';

import { SimpleLogin } from './extras/simple-login';


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
      },
      seeds: {
        black_bmw: { model: 'BMW', color: 'black' }
      }
    },
    Driver: {
      attributes: {
        firstname: 'string!',
        lastname: 'string',
      },
      assocFrom: ['Department'],
      seeds: {
        Faker: {
          count: 100,
          firstname: 'faker.name.firstName',
          lastname: 'faker.name.lastName'
        },
        max: { firstname: 'Max', lastname: 'Mayer' },
        saad: { firstname: 'Saad'}
      }
    },
    Department: {
      attributes: {
        name: {
          type: 'string',
          required: true,
          unique: 'Company'
        }
      },
      assocToMany: 'Driver',
      assocTo: 'Company!',
      seeds: {
        Faker: {
          count: 30,
          name: 'faker.commerce.department',

        },
        hr_disphere: { Company: 'disphere', Driver: ['max', 'saad'], name: 'hr' },
        hr_ms: { Company: 'ms', Driver: ['saad'], name: 'hr' },
      }
    },
    Company: {
      attributes: {
        name: 'key'
      },
      assocFrom: 'Department',
      seeds: {
        Faker: {
          count: 10,
          name: 'faker.company.companyName'
        },
        disphere: { name: 'Disphere' },
        ms: { name: 'Microsoft' }
      }
    }
  }
};

export const domainDefinition = new DomainDefinition( domainConfiguration );
















































export const login = ( config:ApolloServerExpressConfig ):DomainDefinition => {
  const domainDefinition = new DomainDefinition( `${__dirname}/config-types/d2prom` );
  SimpleLogin.addToDefinition( domainDefinition, config );
  return domainDefinition;
}







































export const doc = () => {
  return `${__dirname}/config-types/doc`;
}






export const d2prom = ():DomainDefinition => {

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

  return domainDefinition;
}
