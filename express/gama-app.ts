import { ApolloServerExpressConfig } from 'apollo-server-express';
import { DomainDefinition, GamaServer } from 'graph-on-rails';
import depthLimit from 'graphql-depth-limit';

import { domainConfiguration } from './domain-configuration';
import { addLogin } from './impl/jwt-login';

const apolloConfig:ApolloServerExpressConfig = { validationRules: [depthLimit(7)] };

// load domain configuration from yaml files in folder ./domain-configuration
const domainDefinition:DomainDefinition = new DomainDefinition( './domain-configuration' );

// add configuration from ./domain-configuration.ts
domainDefinition.add( domainConfiguration );

// add custom code
addLogin( domainDefinition );

const gamaConfig = { domainDefinition };

export const gama = async() => GamaServer.create( apolloConfig, gamaConfig );
