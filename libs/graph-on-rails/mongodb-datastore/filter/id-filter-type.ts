import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull } from 'graphql';
import _ from 'lodash';
import { ObjectID } from 'mongodb';
import { AttributeFilterType } from './attribute-filter-type';

/**
 *
 */
export class IdFilterType extends AttributeFilterType {

  graphqlTypeName() { return GraphQLID.name }

  attributes() { return {
    eq: { graphqlType: GraphQLID, description: 'equal' },
    ne: { graphqlType: GraphQLID, description: 'not equal' },
    isIn: { graphqlType: new GraphQLList(GraphQLID), description: 'ID is in list' },
    notIn: { graphqlType: new GraphQLList(GraphQLID), description: 'ID is not in list' },
    exist: { graphqlType: GraphQLBoolean }
  }}

  setFilterExpression( expression:any, condition:any, field:string ):any {
    const e = this.getFilterExpression( condition );
    if( ! e ) return;
    if( field === 'id' ) field = '_id';
    _.set( expression, field, e );
  } 

  getFilterExpression( condition:any ):any {
    return _.merge( {}, ... _.compact( _.map( condition, (operand, operator) => this.getOperation( operator, operand ) ) ) );
  }

  private getOperation( operator:string, operand:any ):any {
    operand = _.isBoolean( operand ) ? operand :
      _.isArray( operand ) ? _.map( operand, op => new ObjectID(op)) : new ObjectID( operand );
    switch( operator ){
      case 'eq': return { $eq : operand };
      case 'ne': return { $ne : operand };
      case 'isIn': return { $in : operand };
      case 'notIn': return { $nin : operand };
      case 'exist': return operand === false ? { $eq: null } : { $ne: null };
    }
    console.warn(`IDFilter unknown operator '${operator}' `);
  }
}
