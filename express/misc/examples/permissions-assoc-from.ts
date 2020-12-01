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
        brand: 'String'
      },
      assocTo: 'Fleet',
      seeds: {
        fleet1Bmw: { brand: 'BMW', Fleet: 'fleet1' },
        fleet1Porsche: { brand: 'Porsche', Fleet: 'fleet1' },
        fleet2Bmw: { brand: 'BMW', Fleet: 'fleet2' },
        fleet2Opel: { brand: 'Opel', Fleet: 'fleet2' },
        fleet3Bmw: { brand: 'BMW', Fleet: 'fleet3' },
      },
      permissions: {
        user: () => ({brand: { $eq: 'BMW' } })
      }
    }
  }
}
