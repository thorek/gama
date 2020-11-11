import _ from 'lodash';
import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLScalarType,
  GraphQLString,
  Kind,
} from 'graphql';

import { DomainDefinition } from './domain-definition';

import { Runtime } from './runtime';


export class GamaSchemaTypes {

  get graphx() { return this.runtime.graphx }

  constructor( private runtime:Runtime ){}

  async createTypes(){

    this.graphx.type( 'Date', {
      name: 'Date',
      from: GraphQLScalarType,
      parseValue: (value:any) => new Date(value),
      parseLiteral: (ast:any) => ast.kind === Kind.STRING ? new Date(ast.value) : null,
      serialize: (value:any) => value instanceof Date ? value.toJSON() : `[${value}]`
    });

    this.graphx.type( 'JSON', {
      name: 'JSON',
      from: GraphQLScalarType,
      parseValue: (value:any) => value,
      serialize: (value:any) => value
    });

    this.graphx.type('ValidationViolation', {
      name: 'ValidationViolation',
      fields: () => ({
        attribute: { type: GraphQLString },
        message: { type: new GraphQLNonNull( GraphQLString ) }
      })
    });

    this.graphx.type('EntityPaging', {
      name: 'EntityPaging',
      description: 'use this to get a certain fraction of a (large) result set',
      from: GraphQLInputObjectType,
      fields: () => ({
        page: { type: GraphQLNonNull( GraphQLInt ), description: 'page of set, starts with 0' },
        size: { type: new GraphQLNonNull( GraphQLInt ), description: 'number of items in page, 0 means no limit' }
      })
    });

    this.graphx.type('File', {
      name: 'File',
      fields: () => ({
        filename: { type: GraphQLNonNull(GraphQLString) },
        mimetype: { type: GraphQLNonNull(GraphQLString) },
        encoding: { type: GraphQLNonNull(GraphQLString) }
      })
    });

    this.graphx.type('EntityStats', {
      name: 'EntityStats',
      fields: () => ({
        count: { type: GraphQLNonNull(GraphQLInt) },
        createdFirst: { type: this.graphx.type('Date') },
        createdLast: { type: this.graphx.type('Date') },
        updatedLast: { type: this.graphx.type('Date') }
      })
    });

    if(this.runtime.config.stage === 'development') {

      this.runtime.type('mutation').extendFields( () => ({
        seed: {
          type: GraphQLList( GraphQLString ),
          args: { truncate: { type: GraphQLBoolean } },
          resolve: ( root:any, args:any ) =>  this.runtime.seed( args.truncate )
        }
      }));

      if( ! _.isEmpty( this.runtime.entities) ) this.graphx.type('Entity', {
        name: 'Entity',
        from: GraphQLEnumType,
        values: _.reduce( this.runtime.entities,
          (value,  entity) => _.set( value, entity.name, { value: entity.name } ), {} )
      });

      if( ! _.isEmpty( this.runtime.enums) ) this.graphx.type('Enum', {
        name: 'Enum',
        from: GraphQLEnumType,
        values: _.reduce( this.runtime.enums,
          (values, enumName) => _.set( values, enumName, { value: enumName } ), {} )
      });

      console.log( _.reduce( this.runtime.enums,
        (values, enumName) => _.set( values, enumName, { value: enumName } ), {} ) )

      this.runtime.type('query').extendFields( () => {
        return {
          domainDefinition: {
            type: this.runtime.type( 'JSON' ),
            args: {
              entity: { type: this.runtime.type( _.isEmpty( this.runtime.enums) ? 'String' : 'Entity' ) },
              enum: { type: this.runtime.type( _.isEmpty( this.runtime.enums) ? 'String' : 'Enum' ) }
            },
            resolve: (root:any, args:any) => this.resolveDomainDefinition( args )
          }
        };
      });
    }
  }

  private resolveDomainDefinition( args:any ) {
    if( args.entity ) return this.resolveEntityDefinition( args.entity );
    if( args.enum ) return this.resolveEnumDefinition( args.enum );
    return this.runtime.config.domainDefinition as DomainDefinition;
  }

  private resolveEntityDefinition( entity:string ) {
    const config = _.get( this.runtime.config.domainDefinition, ['configuration', 'entity', entity ] );
    if( config ) return _.set( {}, entity, config );
  }

  private resolveEnumDefinition( enumName:string ) {
    const config = _.get( this.runtime.config.domainDefinition, ['configuration', 'enum', enumName ] );
    if( config ) return _.set( {}, enumName, config );
  }

}
