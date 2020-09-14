import { GraphQLBoolean } from 'graphql';
import _ from 'lodash';

import { FilterType } from '../../graph-on-rails/builder/filter-type';

/**
 *
 */
export class IntFilterType extends FilterType{

  graphqlType() { return GraphQLBoolean }

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
    console.warn(`IntFilter unknown operator '${operator}' `);
  }
}
