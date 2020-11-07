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
