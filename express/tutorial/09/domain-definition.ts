import { DomainConfiguration, DomainDefinition, Runtime } from 'graph-on-rails';
import { resolve } from 'path';

// load all definition in yaml files here
const domainConfigurationFolder = `${__dirname}/domain-configuration`;

// you can add object based configuration here
const domainConfiguration:DomainConfiguration = {
  query: {
    unassigned_cars: (rt:Runtime) => ({
      type: '[Car]',
      args: {
        sort: { type: 'CarSort' },
        paging: { type: 'EntityPaging' }
      },
      resolve: async ( root:any, args:any, context:any ) => {
        args.filter = { driverId: { exist: false } };
        return rt.entity( 'Car' ).resolver.resolveTypes( { root, args, context } )
      }
    })
  }
}

const domainDefinition:DomainDefinition = new DomainDefinition( domainConfigurationFolder );
domainDefinition.add( domainConfiguration );

export {domainDefinition};
