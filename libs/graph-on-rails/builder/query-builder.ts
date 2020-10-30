import _ from 'lodash';

import { Runtime } from '../core/runtime';
import { SchemaBuilder } from './schema-builder';

export type QueryConfig = {
  query:(runtime:Runtime) => any;
}

export abstract class QueryBuilder extends SchemaBuilder {

  build(){
    this.graphx.type( 'query' ).extendFields( () => {
      return _.set( {}, this.name(), this.query() );
    });
  }

  abstract query():any;
}

export class QueryConfigBuilder extends QueryBuilder {
  static create( name:string, config:QueryConfig ):QueryConfigBuilder {
    return new QueryConfigBuilder( name, config );
  }

  name() { return this._name }
  query(){ return this.config.query( this.runtime ) }

  constructor( protected readonly _name:string, protected readonly config:QueryConfig ){ super() }
}
