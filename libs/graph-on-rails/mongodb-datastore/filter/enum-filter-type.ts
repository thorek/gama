import { GraphQLEnumType, GraphQLList } from 'graphql';
import _ from 'lodash';

import { FilterType } from '../../builder/filter-type';

//
//
export class EnumFilterType extends FilterType {

  constructor( private enumName:string ){ super() }

  graphqlTypeName() { return this.graphx.type( this.enumName )?.name }

  attributes() {
    const enumType = this.graphx.type( this.enumName );
    return {
      ne: { graphqlType: enumType},
      eq: { graphqlType: enumType },
      in: { graphqlType: new GraphQLList( enumType ) },
      notIn: { graphqlType: new GraphQLList( enumType ) }
    }
  }

  getFilterExpression( condition:any, field:string ):any {
    return _.merge( {}, ... _.compact( _.map( condition, (operand, operator) => this.getOperation( operator, operand ) ) ) );
  }

  private getOperation( operator:string, operand:any ):any {
    const enumType = this.graphx.type( this.enumName );
    if( ! ( enumType instanceof GraphQLEnumType ) ) return null;
    switch( operator ){
      case 'eq': return { $eq: operand };
      case 'ne': return { $ne: operand };
      case 'in': return { $in: operand };
      case 'notIn': return { $nin: operand };
    }
    console.warn(`EnumFilterType '${this.enumName}' unknown operator '${operator}' `);
  }

}
