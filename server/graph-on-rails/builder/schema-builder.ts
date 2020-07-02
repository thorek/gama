import _ from 'lodash';

import { Context } from '../core/context';
import { TypeAttribute } from '../entities/type-attribute';

/**
 * Base class for any custom type that can occur in a GraphQL Schema
 */
export abstract class SchemaBuilder {
  get context() { return this._context }
  get graphx() {return this.context.graphx };

  private _context!:Context;

  //
  //
  static getFilterName( type:string ):string { return `${type}Filter` }

  abstract name():string;
  attributes():{[name:string]:TypeAttribute} { return {} }

  //
  //
  init( context:Context ):void { this._context = context }

  //
  //
  createTypes():void { this.createObjectType(); }

  //
  //
  extendTypes():void {}

  //
  //
  protected abstract createObjectType():void;

  //
  //
  public attribute( name:string):TypeAttribute {
    return this.attributes()[name];
  }


}

