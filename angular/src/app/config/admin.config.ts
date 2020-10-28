import { clientsConfig } from './clients.config';
import { organisationsConfig } from './organisations.config';
import { processingActivitiesConfig } from './processing_activities.config';
import { AdminConfigType } from '../../admin/lib/admin-config';

export const adminConfig:AdminConfigType = {
  entities:{
    clients: {
      show: {
        assoc: [ { path: 'phv_offers', assoc: ['versicherers']} ],
        table: [{path: 'phv_offers'}]
      }
    },
    organisations: organisationsConfig,
    processing_activities: processingActivitiesConfig
  }
}
