import _ from 'lodash';
import { DomainConfiguration, ResolverHookContext } from "graph-on-rails";

export const domainConfiguration:DomainConfiguration = {
  entity: {
    Fleet: {
      attributes: {
        name: 'Key'
      },
      assocFrom: 'Car',
      permissions: {
        manager: true
      },
      seeds: {
        fleet1: { name: 'Fleet1' },
        fleet2: { name: 'Fleet2' },
        fleet3: { name: 'Fleet3' },
      }
    },
    Driver: { 
      attributes: {
        firstname: 'String',
        lastname: 'String'
      },
      seeds: {
        10: {
          firstname: { eval: 'faker.name.firstName()' },
          lastname: { eval: 'faker.name.lastName()' }
        }
      }
    },
    Car: {
      attributes: {
        brand: 'String',
        mileage: 'Int',
        price: 'Int'
      },
      assocTo: 'Fleet',
      assocToMany: 'Driver',
      assocFrom: 'Accessory',
      permissions: {
        manager: true,
        assistant: {
          read: true
        }
      },
      seeds: {
        fleet1Bmw: { brand: 'BMW', mileage: 10000, Fleet: 'fleet1', Driver: { sample: 'Driver', size: 3 } },
        fleet1Porsche: { brand: 'Porsche', mileage: 20000, Fleet: 'fleet1', Driver: { sample: 'Driver', size: 2 } },
        fleet2Bmw: { brand: 'BMW', mileage: 13000, Fleet: 'fleet2', Driver: { sample: 'Driver', size: 1 } },
        fleet2Opel: { brand: 'Opel', mileage: 23000, Fleet: 'fleet2', Driver: { sample: 'Driver', size: 2 } },
        fleet3Bmw: { brand: 'BMW', mileage: 45000, Fleet: 'fleet3', Driver: { sample: 'Driver', size: 4 } }
      },
      hooks: {
        afterTypeQuery: (resolved:any, {runtime, resolverCtx} ) =>
          runtime.principalHasRole( 'assistant', resolverCtx ) ?
            _.pick( resolved, ['id', 'brand'] ) : resolved,
        afterTypesQuery: (resolved:any, {runtime, resolverCtx} ) =>
          runtime.principalHasRole( 'assistant', resolverCtx ) ?
            _.map( resolved, item => _.pick( item, ['id', 'brand'] ) ) : resolved
      }
    },
    Accessory: {
      attributes: {
        name: 'String',
        price: 'Int'
      },
      assocTo: 'Car',
      seeds: {
        30: {
          name: { eval: 'faker.commerce.productName()' },
          price: { eval: 'ld.random(100)' },
          Car: { sample: 'Car' }
        }
      }
    },
    CarLimited: {
      attributes: {
        brand: 'String'
      },
      assocTo: 'Fleet',
      assocFrom: 'Accessory',
      collection: 'cars',
      foreignKey: 'carId',
      typeQuery: () => ({brand: 'Demo Car Brand'}),
      statsQuery: false,
      createMutation: false,
      updateMutation: false,
      deleteMutation: false
    }
  }
}
