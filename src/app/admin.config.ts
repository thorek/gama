import * as _ from 'lodash';
import { AdminConfigType, ActionType } from './services/admin.service';

export const adminConfig = async ():Promise<AdminConfigType> => {
  return {
    entities:{
      clients: {
        index: { fields: ['name','city','dsb'] },
        show: {
          assoc: {
            organisations: {
              display: 'table',
              fields: [
                'name',
                {
                  name: 'industries',
                  value:(organisation:any) =>
                    _.join( _.map( organisation.industries, (industry:any) => industry.name ), ', ')
                }
              ]
            }
          }
        }
      },
      organisations: {
        index: {
          assoc: {
            clients: { fields: ['id','name'] },
            industries: { fields: ['name'] }
          },
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
              value: (organisation:any) => organisation.client.name
            }
          ]
        },
        show: {
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
              link: (organisation:any) => ['/admin', 'clients', organisation.client.id]
            }
          ],
          assoc: {
            clients: { fields: ['id','name'] },
            industries: { fields: ['name'] },
            organisational_units: {
              display: 'table',
              fields: [ 'name', 'description']
            }
          }
        }
      },
      processing_activities: {
      },
      foo: {
        name: (entity:any) => entity.name,
      }
    }
  }
}

// IDEA fields generisch verhalten definieren, dann index/Show/edit Fields nur string[] um auswahlt und
// reihenfolge zu definieren
