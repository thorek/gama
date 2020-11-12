import { DomainConfiguration, Runtime } from 'graph-on-rails';
import _ from 'lodash';
import YAML from 'yaml';

const winnerYear = {
  Toyota: [2020, 2019, 2018],
  Porsche: [2017,2016,2015,2014,2013,2012,2011,2010],
  Peugeot: [2009],
  Audi: [2008,2007,2006,2005,2004],
  Bentley:[2003]
}

const repaint = async (rt:Runtime, id:string, color:string) => {
  const car = rt.entity('Car');
  const c = await car.findById( id );
  c.item.color = color;
  return (await c.save()).item;
}

const domainConfiguration:DomainConfiguration = {
  query: {
    leMansWinner: (rt:Runtime) => ({
      type: '[Int!]',
      args: { brand: { type: 'CarBrand' } },
      resolve: ( root:any, args:any ) => _.get( winnerYear, args.brand as string )
    })
  },
  mutation: {
    repaint: (rt:Runtime) => ({
      type: 'Car',
      args: { id: { type: 'ID' }, color: { type: 'String!' } },
      resolve: async (root:any, args:any) => repaint( rt, args.id, args.color )
    })
  }
}

// export const example1 = new DomainDefinition( './config-types/car-config-1');
// example1.add( domainConfiguration );

export const example4:DomainConfiguration = {
  entity: {
    Car: {
      attributes: {
        brand: {
          type: 'String',
          unique: true
        }
      },
      seeds: {
        mercedes: { brand: 'Mercedes' },
        vw: { brand: 'Volkswagen' },
      }
    }
  }
}


export const example5:DomainConfiguration = {
  entity: {
    Organisation: {
      attributes: { name: 'Key' },
      seeds: { ms: { name: 'Microsoft' }, fb: { name: 'Facebook' } },
      assocFrom: 'Department'
    },
    Department: {
      attributes: { name: { type: 'String!', unique: 'Organisation' } },
      assocTo: 'Organisation!',
      seeds: { hrms: { name: 'HR', Organisation: 'ms' } }
    }
  }
}


export const unique1:DomainConfiguration = {
  entity: {
    Car: {
      attributes: {
        brand: 'String',
        licence: 'Key'
      },
      seeds: {
        red_mercedes: { brand: 'Mercedes', licence: 'HH-BO 2020' }
      }
    }
  }
}


export const unique2:DomainConfiguration = {
  entity: {
    Car: {
      attributes: {
        brand: 'String',
        color: { type: 'String', unique: 'brand' }
      },
      seeds: {
        red_mercedes: { brand: 'Mercedes', color: 'red' }
      }
    }
  }
}

export const file1:DomainConfiguration = {
  entity: {
    Car: {
      attributes: {
        brand: 'String!',
        image: 'File'
      }
    }
  }
}

export const list1:DomainConfiguration = {
  entity: {
    Car: {
      attributes: {
        licence: 'Key',
        repairsAtKm: '[Int!]',
        tags: { type: 'String', required: true, list: true }
      },
      seeds: {
        1: { licence: 'HH TR 2929', repairsAtKm: [30000, 20000, 40000], tags: ['foo', 'bar', 'foobar'] },
        2: { licence: 'MA HH 4324', repairsAtKm: [10000, 55000, 44000, 5000], tags: [] },
        3: { licence: 'BO ZU 7365', repairsAtKm: [5500, 100], tags: ['foo', 'bar', 'baz'] },
        4: { licence: 'LG ZT 6578', repairsAtKm: [], tags: ['foobar'] }
      }
    }
  }
}

export const defaultValue1:DomainConfiguration = YAML.parse(`
entity:
  Car:
    attributes:
      brand: String!
      color:
        type: String
        default: white
      mileage:
        type: Int!
        default: 0
`)

export const defaultValue2:DomainConfiguration = {
  entity: {
    Car: {
      attributes: {
        brand: 'String!',
        color: {
          type: 'String',
          default: 'white'
        },
        registration: {
          type: 'Date',
          default: (rt:Runtime) => new Date()
        }
      }
    }
  }
}

export const filterType1:DomainConfiguration = {
  entity: {
    Car: {
      attributes: {
        brand: {
          type: 'String!',
          filterType: false
        },
        color: 'String!',
        mileage: 'Int!'
      }
    }
  }
}

export const description1:DomainConfiguration = YAML.parse(`
entity:
  Car:
    attributes:
      brand: String!
      color:
        type: String
        description: >
          this is not really evaluated anywhere
          and just informal collected
`);
