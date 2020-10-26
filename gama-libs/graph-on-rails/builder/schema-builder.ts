import _ from 'lodash';

import { Context } from '../core/context';
import { TypeAttribute } from '../entities/type-attribute';


/**
 * Base class for any custom type that can occur in a GraphQL Schema
 */
export abstract class SchemaBuilder {

  private _context!:Context;

  get context() { return this._context }
  get graphx() {return this.context.graphx };

  init( context:Context ):void { this._context = context }

  abstract name():string;
  abstract build():void;
}


/**
 * Base class for any custom type that can occur in a GraphQL Schema
 */
export abstract class TypeBuilder extends SchemaBuilder {

  //
  //
  static getFilterName( type:string ):string { return `${type}Filter` }

  attributes():{[name:string]:TypeAttribute} { return {} }

  //
  //
  public attribute( name:string):TypeAttribute {
    return this.attributes()[name];
  }
}

