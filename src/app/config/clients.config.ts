import * as _ from 'lodash';
import { EntityConfigType } from '../lib/admin-config';

export const clientsConfig:EntityConfigType = {
  name: (client:any) => `${client.name} (${client.id})`,
  action: (event:any) => event.action === 'some' ? console.log(`some ${event.id}`) : console.log('none'),
  index: {
    fields: [
      'name',
      {name: 'city', filter: true},
      'dsb'
    ]
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
      }
    ]
  }
}
