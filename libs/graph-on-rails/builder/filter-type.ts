import { GraphQLInputObjectType, GraphQLType } from 'graphql';
import _ from 'lodash';

import { Runtime } from '../core/runtime';
import { SchemaBuilder, TypeBuilder } from './schema-builder';


/**
 * Base class for all Filter Types
 */
export abstract class FilterType extends TypeBuilder {

  name() { return TypeBuilder.getFilterName( this.graphqlTypeName() ) }

  init( runtime:Runtime ):void {
    super.init( context );
    _.set( context.filterTypes, this.name(), this );
  }

  abstract graphqlTypeName():string;

  abstract getFilterExpression( args:any, field:string ):any;

  build():void {
    const filterName = this.name();
    this.graphx.type( filterName, {
      name: filterName,
      from: GraphQLInputObjectType,
      fields: () => {
        const fields = {};
        this.setAttributes( fields );
        return fields;
      }
      });
  }

  protected setAttributes( fields:any ):void {
    _.forEach( this.attributes(), (attribute,name) => {
      _.set( fields, name, { type: attribute.graphqlType, description: attribute.description } );
    });
  }

}
