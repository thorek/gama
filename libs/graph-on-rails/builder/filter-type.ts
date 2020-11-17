import { GraphQLInputObjectType } from 'graphql';
import _ from 'lodash';

import { Runtime } from '../core/runtime';
import { Entity } from '../entities/entity';
import { TypeBuilder } from './schema-builder';


/**
 * Base class for all Filter Types
 */
export abstract class FilterType extends TypeBuilder {

  name() { return TypeBuilder.getFilterName( this.graphqlTypeName() ) }

  init( runtime:Runtime ):void {
    super.init( runtime );
    _.set( runtime.filterTypes, this.name(), this );
  }

  abstract graphqlTypeName():string;

  abstract async setFilterExpression( expression:any, args:any, field?:string, entity?:Entity ):Promise<void>;

  static async setFilterExpression( expression:any, entity:Entity, condition:any, field:string ){
    const filterTypeName = entity.getFilterTypeName(field);
    if( ! filterTypeName ) return;
    const filterType = entity.runtime.filterTypes[filterTypeName];
    if( ! filterType ) return;
    return filterType.setFilterExpression( expression, condition, field, entity );
  }

  build():void {
    const filterName = this.name();
    this.graphx.type( filterName, {
      name: filterName,
      from: GraphQLInputObjectType,
      fields: () => this.getFilterAttributes()
    });
  }

  protected getFilterAttributes() {
    const fields = {};
    _.forEach( this.attributes(), (attribute,name) => {
      _.set( fields, name, { type: attribute.graphqlType, description: attribute.description } );
    });
    return fields;
  }

}
