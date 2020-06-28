import * as _ from 'lodash';
import { AdminConfigType, ActionType } from './services/admin.service';

export const adminConfig = async ():Promise<AdminConfigType> => {
  return {
    menu: ['clients','organisations','processing_activities'],
    entities:{
      title: "Clients",
      clients: {
        index: {
          fields: ['name','city','dsb']
        },
        show: {
          assoc: [ 'organisations' ],
          table: [
            {
              fields: [
                'name',
                {
                  name: 'industries',
                  value:(organisation:any) =>
                    _.join( _.map( organisation.industries, (industry:any) => industry.name ), ', ')
                }
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
                _.join( _.map( organisation.industries, (industry:any) => industry.name ), ', ')
            },
            {
              name: 'client',
              value: (organisation:any) => organisation.client.name
            }
          ]
        },
        show: {
          assoc: [
            'clients', 'industries', 'organisational_units'
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
              link: (organisation:any) => ['/admin', 'clients', organisation.client.id]
            }
          ],
          table: [
            {
              title: 'Org Units',
              fields: [ 'name', 'description'],
            }
          ]
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
