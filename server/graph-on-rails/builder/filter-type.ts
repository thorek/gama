import { GraphQLInputObjectType, GraphQLType } from 'graphql';
import _ from 'lodash';

import { Context } from '../core/context';
import { SchemaBuilder } from './schema-builder';


/**
 * Base class for all Filter Types
 */
export abstract class FilterType extends SchemaBuilder {


  //
  //
  name() { return SchemaBuilder.getFilterName( _.get(this.graphqlType(), "name") ) }

	//
	//
	init( context:Context ):void {
    super.init( context );
    _.set( context.filterTypes, this.name(), this );
	}

  //
  //
  abstract graphqlType():GraphQLType;

  //
  //
  abstract getFilterExpression( args:any, field:string ):any;

	//
	//
	protected createObjectType():void {
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

	//
	//
	extendTypes():void {}

	//
	//
	protected setAttributes( fields:any ):void {
		_.forEach( this.attributes(), (attribute,name) => {
			_.set( fields, name, { type: attribute.graphqlType, description: attribute.description } );
		});
	}

}
