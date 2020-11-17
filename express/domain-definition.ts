import { DomainConfiguration, DomainDefinition } from "graph-on-rails";

// load all definition in yaml files here
const domainConfigurationFolder = './domain-configuration';

// you can add object based configuration here
export const domainConfiguration:DomainConfiguration = {

}

const domainDefinition:DomainDefinition = new DomainDefinition( domainConfigurationFolder );
domainDefinition.add( domainConfiguration );

export {domainDefinition};
