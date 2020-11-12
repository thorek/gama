import { DomainConfiguration, Runtime } from 'graph-on-rails';
import _ from 'lodash';


export const example2:DomainConfiguration = {
  entity:{
    Car: {
      attributes: {
        brand: 'string!',
        mileage: 'int'
      },
      seeds: {
        Faker: {
          count: 100,
          brand: () => _.sample( ['Toyota', 'Porsche', 'Peugeot', 'Audi', 'Bentley'] ),
          mileage: () => _.round( _.random( 10000, 150000))
        }
      }
    }
  }
}

export const example3:DomainConfiguration = {
  entity:{
    Car: {
      attributes: {
        brand: 'string!',
        mileage: 'int'
      },
      validation: (item:any) => (item.brand !== 'Mercedes' && item.mileage > 300000 ) ? 'I wouldnt believe that' : undefined
    }
  }
}

