import _ from 'lodash';
import { DomainConfiguration } from "graph-on-rails";

export const domainConfiguration:DomainConfiguration = {
  entity: {
    Fleet: {
      attributes: {
        name: 'Key'
      },
      assocFrom: 'Car',
      seeds: {
        fleet1: { name: 'Fleet1' },
        fleet2: { name: 'Fleet2' },
        fleet3: { name: 'Fleet3' },
      },
      permissions: {
        user: () => ( { name: { $in: ['Fleet1', 'Fleet2' ] } } )
      }
    },
    Car: {
      attributes: {
        brand: 'String',
        mileage: {
          type: 'Int',
          resolve: ({principal, item}) => _.includes(principal.roles, 'manager') ? item.mileage : null
        }
      },
      assocTo: 'Fleet',
      permissions: {
        manager: true,
        user: () => ({brand: { $eq: 'BMW' } })
      },
      seeds: {
        fleet1Bmw: { brand: 'BMW', mileage: 10000, Fleet: 'fleet1' },
        fleet1Porsche: { brand: 'Porsche', mileage: 20000, Fleet: 'fleet1' },
        fleet2Bmw: { brand: 'BMW', mileage: 13000, Fleet: 'fleet2' },
        fleet2Opel: { brand: 'Opel', mileage: 23000, Fleet: 'fleet2' },
        fleet3Bmw: { brand: 'BMW', mileage: 45000, Fleet: 'fleet3' },
      }
    }
  }
}
