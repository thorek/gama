import { GraphQLBoolean, GraphQLList, GraphQLString } from 'graphql';
import _ from 'lodash';

import { FilterType } from '../../builder/filter-type';

/**
 *
 */
export class StringFilterType extends FilterType{

  graphqlTypeName() { return GraphQLString.name }

  //
  //
  attributes() { return {
    is: { graphqlType: GraphQLString },
    isNot: { graphqlType: GraphQLString },
    in: { graphqlType: new GraphQLList(GraphQLString) },
    notIn: { graphqlType: new GraphQLList(GraphQLString) },
    contains: { graphqlType: GraphQLString },
    doesNotContain: { graphqlType: GraphQLString },
    beginsWith: { graphqlType: GraphQLString },
    endsWith: { graphqlType: GraphQLString },
    caseSensitive: { graphqlType: GraphQLBoolean }
  }}

  //
  //
  getFilterExpression( condition:any, field:string ):any {
    const caseSensitive = _.get( condition, 'caseSensitive' ) === true;
    delete condition.caseSensitive;
    const operations = _.compact( _.map( condition,
      (operand, operator) => this.getOperation( operator, operand, caseSensitive ) ) );
    return _.size( operations ) > 1 ? { $and: operations } : _.first( operations );
  }

  //
  //
  private getOperation( operator:string, operand:any, caseSensitive:boolean ):any {
    const i = caseSensitive ? undefined : 'i';
    switch( operator ){
      case 'is': return {$eq: operand};
      case 'isNot': return {$ne: operand } ;
      case 'in': return { $in: operand };
      case 'notIn': return { $nin: operand };
      case 'contains': return {$regex : new RegExp(`.*${operand}.*`, i) };
      case 'doesNotContain':return {$regex : new RegExp(`.*^[${operand}].*`, i) };
      case 'beginsWith': return {$regex : new RegExp(`^${operand}`, i) };
      case 'endsWith': return {$regex : new RegExp(`${operand}$`, i) };
    }
    console.warn(`StringFilterType unknown operator '${operator}' `);

  }
}
