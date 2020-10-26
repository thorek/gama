import { FilterType } from 'graph-on-rails';
import { GraphQLBoolean } from 'graphql';
import _ from 'lodash';

/**
 *
 */
export class BooleanFilterType extends FilterType{

  graphqlTypeName() { return GraphQLBoolean.name }

  attributes() { return {
    is: { graphqlType: GraphQLBoolean, description: 'is' },
    isNot: { graphqlType: GraphQLBoolean, description: 'is not' }
  }}

  getFilterExpression( condition:any, field:string ):any {
    const operator = _.toString( _.first( _.keys( condition ) ) );
    const operand = condition[operator];
    switch( operator ){
      case 'is': return { $eq : operand };
      case 'isNot': return { $ne : operand };
    }
    console.warn(`BooleanFilter unknown operator '${operator}' `);
  }
}
