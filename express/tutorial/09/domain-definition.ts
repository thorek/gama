import { DomainConfiguration, DomainDefinition, Runtime } from 'graph-on-rails';

// load all definition in yaml files here
const domainConfigurationFolder = `${__dirname}/domain-configuration`;

// you can add object based configuration here
const domainConfiguration:DomainConfiguration = {
  entity: {
    Car: {
      validation: async (item:any, rt:Runtime ) => {
        const driver = await rt.entity('Driver').findOneByAttribute( { id: item.driverId } );
        if( ! driver ) return;
        const ms30days = 30 * 24 * 60 * 60 * 1000;
        if( driver.item.licenceValid - Date.now() > ms30days ) return;
        return { attribute: 'driverId', message: "Sorry, driver's licence must be at least 30 days valid" };
      }
    }
  }
}

const domainDefinition:DomainDefinition = new DomainDefinition( domainConfigurationFolder );
domainDefinition.add( domainConfiguration );

export {domainDefinition};
