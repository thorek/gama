import { GraphQLEnumType } from 'graphql';
import _, { Dictionary } from 'lodash';

import { SchemaBuilder } from './schema-builder';

export abstract class EnumBuilder extends SchemaBuilder {


  abstract enum():Dictionary<any>


  protected createObjectType(): void {
    const name = this.name();
    const values = {};
    _.forEach( this.enum(), (value,key) => _.set( values, key, { value }));
    this.graphx.type( name, { name, values, from: GraphQLEnumType	} );
  }

  //
  //
  extendTypes():void {
    this.createEnumFilter();
  }

	//
	//
	protected createEnumFilter():void {
    const filterType = this.context.dataStore.getEnumFilterType( this.name() );
    filterType.init( this.context );
    filterType.createTypes();
    filterType.extendTypes();
	}


}
