import { DomainConfiguration, DomainDefinition, Runtime } from "graph-on-rails";
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

export const example1 = new DomainDefinition( './config-types/car-config-1');
example1.add( domainConfiguration );


export const queryConfig:DomainConfiguration = YAML.parse(`
enum:
  CarBrand:
    - Mercedes
    - Porsche
    - Audi
    - BMW
  Color:
    - red
    - green
    - black
entity:
  Car:
    attributes:
      licence: Key
      brand: CarBrand!
      colors: "[Color]"
  Driver:
    attributes:
      firstname: String
      lastname: String!
`);
