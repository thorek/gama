import { GraphQLEnumType } from 'graphql';
import _, { Dictionary } from 'lodash';

import { TypeBuilder } from './schema-builder';

export type EnumConfig = Dictionary<any>|(string[])


export abstract class EnumBuilder extends TypeBuilder {

  abstract enum():Dictionary<any>

  build() {
    const name = this.name();
    const values = {};
    _.forEach( this.enum(), (value,key) => _.set( values, key, { value }));
    this.graphx.type( name, { name, values, from: GraphQLEnumType	} );
  }

  extendTypes():void {
    this.createEnumFilter();
  }

  protected createEnumFilter():void {
    const filterType = this.runtime.dataStore.getEnumFilterType( this.name() );
    filterType.init( this.runtime );
    filterType.build();
  }

}

export class EnumConfigBuilder extends EnumBuilder {

  static create( name:string, enumConfig:EnumConfig ):EnumConfigBuilder {
    return new EnumConfigBuilder( name, enumConfig );
  }

  name() { return this._name }
  enum(){
    return _.isArray( this.config) ?
      _.reduce( this.config, (config, item) => _.set( config, _.toUpper( item ), _.toLower( item ) ), {} ) :
      this.config;
  }

  constructor( protected readonly _name:string, protected readonly config:EnumConfig ){ super() }

}
