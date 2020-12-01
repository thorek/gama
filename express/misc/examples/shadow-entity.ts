import _ from 'lodash';
import { DomainConfiguration } from "graph-on-rails";

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
    Car: {
      attributes: {
        brand: 'String',
        mileage: 'Int',
        price: 'Int'
      },
      assocTo: 'Fleet',
      assocFrom: 'Accessory',
      permissions: 'Fleet',
      seeds: {
        fleet1Bmw: { brand: 'BMW', mileage: 10000, Fleet: 'fleet1' },
        fleet1Porsche: { brand: 'Porsche', mileage: 20000, Fleet: 'fleet1' },
        fleet2Bmw: { brand: 'BMW', mileage: 13000, Fleet: 'fleet2' },
        fleet2Opel: { brand: 'Opel', mileage: 23000, Fleet: 'fleet2' },
        fleet3Bmw: { brand: 'BMW', mileage: 45000, Fleet: 'fleet3' },
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
      foreignKey: 'carId'
    }
  }
}
