import _ from 'lodash';

import { QueryConfigFn } from '../core/domain-configuration';
import { SchemaBuilder } from './schema-builder';

export abstract class QueryBuilder extends SchemaBuilder {

  build(){
    this.graphx.type( 'query' ).extendFields( () => {
      return _.set( {}, this.name(), this.query() );
    });
  }

  abstract query():any;
}

export class QueryConfigBuilder extends QueryBuilder {
  static create( name:string, config:QueryConfigFn ):QueryConfigBuilder {
    return new QueryConfigBuilder( name, config );
  }

  name() { return this._name }
  query(){ return this.config( this.runtime ) }

  constructor( protected readonly _name:string, protected readonly config:QueryConfigFn ){ super() }
}
