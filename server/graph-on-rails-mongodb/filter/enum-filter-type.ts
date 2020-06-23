import { GraphQLEnumType, GraphQLInputObjectType, GraphQLList } from 'graphql';
import _ from 'lodash';

import { FilterType } from '../../graph-on-rails/builder/filter-type';

//
//
export class EnumFilterType extends FilterType {

	//
	//
	constructor( private enumName:string ){ super() }

  graphqlType() { return this.graphx.type( this.enumName ) }

  //
  //
	attributes() {
    const enumType = this.graphx.type( this.enumName );
    return {
      ne: { graphqlType: enumType},
      eq: { graphqlType: enumType },
      in: { graphqlType: new GraphQLList( enumType ) },
      notIn: { graphqlType: new GraphQLList( enumType ) }
    }
  }

	//
	//
	getFilterExpression( condition:any, field:string ):any {
		const enumType = this.graphx.type( this.enumName );
		if( ! ( enumType instanceof GraphQLEnumType ) ) return null;
		const operator = _.toString( _.first( _.keys( condition ) ) );
		const operand = condition[operator];
		switch( operator ){
			case 'eq': return {'$eq': operand};
			case 'nw': return {'$nw': operand } ;
			case 'contains': return {$regex : new RegExp(`.*${operand}.*`, 'i') };
			case 'notContains':return {$regex : new RegExp(`.*^[${operand}].*`, 'i') };
			case 'beginsWith': return {$regex : new RegExp(`${operand}.*`, 'i') };
		}
		console.warn(`EnumFilterType '${this.enumName}' unknown operator '${operator}' `);
	}

}
