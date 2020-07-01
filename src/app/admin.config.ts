import * as _ from 'lodash';

import { AdminConfigType } from './services/admin.service';

export const adminConfig = async ():Promise<AdminConfigType> => {
  return {
    menu: ['clients','organisations','processing_activities'],
    entities:{
      clients: {
        name: (client) => client.name,
        action: (event) => event.action === 'some' ? console.log(`some ${event.id}`) : console.log('none'),
        index: {
          fields: ['name','city','dsb']
        },
        show: {
          assoc: [ { path: 'organisations', assoc: ['industries']} ],
          table: [
            {
              path: 'organisations',
              fields: [
                'name',
                {
                  name: 'industries',
                  value:(organisation:any) =>
                    _.join( _.map( organisation.industries, (industry:any) => industry.name ), ', ')
                }
              ],
              actions: [
                'show', 'some'
              ]
            }
          ]
        }
      },

      organisations: {
        index: {
          assoc: [
            'industries',
            { path: 'clients', fields: ['id', 'name'], assoc: [ {path: 'users'}  ] }
          ],
          fields: [
            'id',
            'name',
            {
              name: 'industries',
              label: 'Assigned Industries',
              value: (organisation:any) =>
                _(organisation.industries).map( industry => industry.name ).join(', ')
            },
            {
              name: 'client',
              value: (organisation:any) => _.get(organisation, 'client.name' ),
              link: (organisation:any) => ['/admin', 'clients', 'show', organisation?.client?.id]
            }
          ]
        },
        show: {
          assoc: [
            'clients', 'industries', 'organisational_units', 'processing_activities'
          ],
          fields: [
            'id',
            'name',
            {
              name: 'industries',
              label: 'Assigned Industries',
              value: (organisation:any) =>
                _.join( _.map( organisation.industries, (industry:any) => industry.name ), ', ')
            },
            {
              name: 'client',
              value: (organisation:any) => organisation.client.name,
              link: (organisation:any) => ['/admin', 'clients', 'show', organisation.client.id]
            }
          ],
          table: [
            {
              path: 'organisational_units',
              fields: [ 'name', 'description'],
            },
            {
              path: 'processing_activities',
              fields: [ 'name', 'description'],
            }
          ]
        }
      },
      processing_activities: {
        index: {
          assoc: [{path: 'organisational_units', assoc: ['organisations']}],
          fields: [
            'name',
            {
              name: 'organisations',
              value: (processingActivity) =>
              _.get( _.first( processingActivity.organisationalUnits ), 'organisation.name' )
            },
            {
              name: 'organisational_units',
              value: (processingActivity) =>
                _(processingActivity.organisationalUnits).map( ou => ou.name ).join(', ')
            }
          ]
        }
      },
      foo: {
        name: (entity:any) => entity.name,
      }
    }
  }
}

