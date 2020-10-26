import { FilterType } from 'graph-on-rails';
import { GraphQLEnumType, GraphQLList } from 'graphql';
import _ from 'lodash';

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
    const enumType = this.graphx.type( this.enumName );
    if( ! ( enumType instanceof GraphQLEnumType ) ) return null;
    const operator = _.toString( _.first( _.keys( condition ) ) );
    const operand = condition[operator];
    switch( operator ){
      case 'eq': return {$eq: operand};
      case 'nw': return {$nw: operand } ;
      case 'contains': return {$regex : new RegExp(`.*${operand}.*`, 'i') };
      case 'notContains':return {$regex : new RegExp(`.*^[${operand}].*`, 'i') };
      case 'beginsWith': return {$regex : new RegExp(`${operand}.*`, 'i') };
    }
    console.warn(`EnumFilterType '${this.enumName}' unknown operator '${operator}' `);
  }

}
