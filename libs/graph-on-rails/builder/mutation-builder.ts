import _ from 'lodash';

import { MutationConfig, MutationConfigFn } from '../core/domain-configuration';
import { SchemaBuilder } from './schema-builder';

export abstract class MutationBuilder extends SchemaBuilder {

  async build(){
    const mutation = await Promise.resolve( this.mutation() );
    _.mapValues( mutation.args, arg => _.isString( arg) ? {type: this.graphx.type(arg)} : arg );
    this.graphx.type( 'mutation' ).extendFields( () => _.set( {}, this.name(), mutation) );
  }

  abstract mutation():Promise<MutationConfig>|MutationConfig;
}

export class MutationConfigBuilder extends MutationBuilder {
  static create( name:string, config:MutationConfigFn ):MutationConfigBuilder {
    return new MutationConfigBuilder( name, config );
  }

  name() { return this._name }
  mutation():Promise<MutationConfig> { return Promise.resolve(this.config( this.runtime )) }

  constructor( protected readonly _name:string, protected readonly config:MutationConfigFn ){ super() }
}
