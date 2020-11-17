import _ from 'lodash';
import { DomainConfiguration, DomainDefinition, Runtime } from "graph-on-rails";

// load all definition in yaml files here
const domainConfigurationFolder = `${__dirname}/domain-configuration`;

// you can add object based configuration here
const domainConfiguration:DomainConfiguration = {
  query: {
    unassigned_cars: (rt:Runtime) => ({
      type: rt.type('[Car]'),
      resolve: async () => _.map( await rt.entity( 'Car' ).findByAttribute( { driverId: null } ), entityItem => entityItem )
    })
  }
}

const domainDefinition:DomainDefinition = new DomainDefinition( domainConfigurationFolder );
domainDefinition.add( domainConfiguration );

export {domainDefinition};
