import _ from 'lodash';
import { SchemaBuilder } from './schema-builder';
import { Runtime } from '../core/runtime';

export type MutationConfig = (runtime:Runtime) => any;

export abstract class MutationBuilder extends SchemaBuilder {

  build(){
    this.graphx.type( 'mutation' ).extendFields( () => {
      return _.set( {}, this.name(), this.mutation() );
    });
  }

  abstract mutation():any;
}

export class MutationConfigBuilder extends MutationBuilder {
  static create( name:string, config:MutationConfig ):MutationConfigBuilder {
    return new MutationConfigBuilder( name, config );
  }

  name() { return this._name }
  mutation(){ return this.config( this.runtime ) }

  constructor( protected readonly _name:string, protected readonly config:MutationConfig ){ super() }
}
