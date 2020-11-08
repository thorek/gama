import { DomainConfiguration, Runtime } from 'graph-on-rails';
import _ from 'lodash';

export const example2:DomainConfiguration = {
  entity:{
    Car: {
      attributes: {
        brand: 'string!',
        mileage: 'int'
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
      validate: (item:any) => (item.brand !== 'Mercedes' && item.mileage > 300000 ) ? 'I wouldnt believe that' : undefined
    }
  }
}
