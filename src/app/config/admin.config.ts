import { clientsConfig } from './clients.config';
import { organisationsConfig } from './organisations.config';
import { processingActivitiesConfig } from './processing_activities.config';
import { AdminConfigType } from '../lib/admin-config';

export const adminConfig = async ():Promise<AdminConfigType> => {
  return {
    menu: ['clients','organisations','processing_activities'],
    entities:{
      clients: clientsConfig,
      organisations: organisationsConfig,
      processing_activities: processingActivitiesConfig
    }
  }
}