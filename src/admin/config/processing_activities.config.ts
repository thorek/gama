import * as _ from 'lodash';
import { EntityConfigType } from '../lib/admin-config';

export const processingActivitiesConfig:EntityConfigType = {
  index: {
    assoc: [{path: 'organisational_units', assoc: ['organisations']}],
    fields: [
      'name',
      {
        path: 'organisations',
        value: (processingActivity) =>
        _.get( _.first( processingActivity.organisationalUnits ), 'organisation.name' )
      },
      {
        path: 'organisational_units',
        value: (processingActivity) =>
          _(processingActivity.organisationalUnits).map( ou => ou.name ).join(', ')
      }
    ]
  }
}
