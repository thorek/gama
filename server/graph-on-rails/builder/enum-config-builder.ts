import _, { Dictionary } from 'lodash';

import { EnumBuilder } from './enum-builder';

/**
 *
 */
export type EnumConfig  = Dictionary<any>|string[]


/**
 *
 */
export class EnumConfigBuilder extends EnumBuilder {

  name(): string { return this._name }
  enum(){
    if( ! _.isArray( this.config) ) return this.config;
    return _.reduce( this.config, (config, item) => {
      return _.set( config, _.toUpper( item ), _.toLower( item ) );
    }, {} )
  }

  /**
   *
   */
  static create( name:string, enumConfig:EnumConfig ):EnumConfigBuilder {
    return new EnumConfigBuilder( name, enumConfig );
  }

  /**
   *
   */
	constructor(
      protected readonly _name:string,
      protected readonly config:EnumConfig )
  { super() }
}
