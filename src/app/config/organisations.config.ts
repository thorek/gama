import * as _ from 'lodash';
import { EntityConfigType } from '../lib/admin-config';

export const organisationsConfig:EntityConfigType = {
  index: {
    assoc: [
      'industries',
      { path: 'clients', fields: ['id', 'name'], assoc: [ {path: 'users'}  ] }
    ],
    fields: [
      'name',
      {
        name: 'industries',
        label: 'Assigned Industries',
        value: (organisation:any) => organisation.industries,
        filter: {
          multiple: true,
        }
      },
      {
        name: 'client',
        parent: 'clients',
        value: (organisation:any) => _.get(organisation, 'client.name' ),
        link: (organisation:any) => ['/admin', 'clients', 'show', organisation?.client?.id]
      },
      {
        name: 'description',
        parent: null
      }
    ],
    defaultActions: ['edit', 'delete'],
    actions: {
      some: { icon: 'home', onAction: (item:any) => console.log('some action called', item.id ) }
    }
  },
  show: {
    assoc: [
      'organisational_units', 'processing_activities'
    ],
    fields: [
      'id',
      'name',
      {
        path: 'industries',
        label: 'Assigned Industries',
        value: (organisation:any) =>
          _.join( _.map( organisation.industries, (industry:any) => industry.name ), ', ')
      },
      {
        path: 'clients',
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
  },
  form: {
    data: ['clients', 'industries'],
    fields: [
      'clients',
      'name',
      'description',
      'industries'
    ]
  }
}
