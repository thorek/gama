import * as _ from 'lodash';
import { EntityConfigType } from 'src/admin/lib/admin-config';

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
      'organisational_units'
    ]
  }
}
