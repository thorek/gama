import * as _ from 'lodash';
import { EntityConfigType } from '../lib/admin-config';

export const clientsConfig:EntityConfigType = {
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
          'industries'
        ]
      }
    ]
  }
}
