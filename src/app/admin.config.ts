import * as _ from 'lodash';
import { AdminConfigType, ActionType } from './services/admin.service';

export const adminConfig = async ():Promise<AdminConfigType> => {
  return {
    entities:{
      clients: {
        index: {
          fields: ['name','city','dsb']
        }
      },
      organisations: {
        index: {
          assoc: {
            client: ['id','name'],
            industries: ['name']
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
