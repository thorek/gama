import { clientsConfig } from './clients.config';
import { organisationsConfig } from './organisations.config';
import { processingActivitiesConfig } from './processing_activities.config';
import { AdminConfigType } from '../../admin/lib/admin-config';

export const adminConfig:AdminConfigType = {
  entities:{
    clients: clientsConfig,
    organisations: organisationsConfig,
    processing_activities: processingActivitiesConfig
  }
}
