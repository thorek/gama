import _ from 'lodash';

import { Context } from '../core/context';
import { SchemaBuilder } from './schema-builder';

export type QueryConfig = {
  query:(context:Context) => any;
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
  query(){ return this.config.query( this.context ) }

  constructor( protected readonly _name:string, protected readonly config:QueryConfig ){ super() }
}
