import _ from 'lodash';
import { FilterType } from '../../graph-on-rails/builder/filter-type';
import { GraphQLInt, GraphQLList } from 'graphql';

/**
 *
 */
export class IntFilterType extends FilterType{

  graphqlType() { return GraphQLInt }

	attributes() { return {
		eq: { graphqlType: GraphQLInt, description: "equal" },
		ne: { graphqlType: GraphQLInt, description: "not equal" },
		le: { graphqlType: GraphQLInt, description: "lower or equal than" },
		lt: { graphqlType: GraphQLInt, description: "lower than" },
		ge: { graphqlType: GraphQLInt, description: "greater or equal than" },
		gt: { graphqlType: GraphQLInt, description: "greater than" },
		isIn: { graphqlType: new GraphQLList(GraphQLInt), description: "is in list of numbers" },
		notIn: { graphqlType: new GraphQLList(GraphQLInt), description: "is not in list of numbers" },
    between: {
      graphqlType: new GraphQLList(GraphQLInt),
      description: "is greater or equal than the first and lower then the last number of a list"
    },
	}}

	//
	//
	getFilterExpression( condition:any, field:string ):any {
		const operator = _.toString( _.first( _.keys( condition ) ) );
		const operand = condition[operator];
		switch( operator ){
			case 'eq': return { $eq : operand };
			case 'ne': return { $ne : operand };
			case 'le': return { $lte: operand };
			case 'lt': return { $lt : operand };
			case 'ge': return { $gte : operand };
      case 'gt': return { $gt : operand };
      case 'isIn': return { $in : operand };
      case 'notIn': return { $nin : operand };
      case 'between': return { $gte: _.first( operand ), $lt: _.last( operand )  };
		}
    console.warn(`IntFilter unknown operator '${operator}' `);
	}
}
