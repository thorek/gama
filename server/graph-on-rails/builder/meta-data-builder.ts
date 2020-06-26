import { GraphQLBoolean, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import _ from 'lodash';

import { Entity } from '../entities/entity';
import { SchemaBuilder } from './schema-builder';

export class MetaDataBuilder extends SchemaBuilder {

  name() { return 'MetaData' }

  protected createObjectType():void {

    const fieldMetaData = new GraphQLObjectType({
      name: 'fieldMetaData',
      fields: {
        name: { type: GraphQLNonNull( GraphQLString ) },
        type: { type: GraphQLString },
        required: { type: GraphQLBoolean },
        unique: { type: GraphQLString },
        virtual: { type: GraphQLBoolean },
        filter: {type: GraphQLString }
      }
    });

    const assocMetaData:GraphQLObjectType = new GraphQLObjectType({
      name: 'assocMetaData',
      fields: {
        path: { type: GraphQLString },
        query: { type: GraphQLString }
      }
    });

    const entityMetaData:GraphQLObjectType = new GraphQLObjectType({
      name: 'entityMetaData',
      fields: () => ({
        path: { type: GraphQLString },
        typeQuery: { type: GraphQLString },
        typesQuery: { type: GraphQLString },
        fields: {
          type: GraphQLList( fieldMetaData ),
          resolve: (root:any) => this.resolveFields(root)
        },
        assocTo: {
          type: GraphQLList( assocMetaData ),
          resolve: (root:any) => this.resolveAssocTo(root)
        },
        assocToMany: {
          type: GraphQLList( assocMetaData ),
          resolve: (root:any) => this.resolveAssocToMany( root )
        },
        assocFrom: {
          type: GraphQLList( assocMetaData ),
          resolve: (root:any) => this.resolveAssocFrom( root )
        },
      })
    });

    this.graphx.type('query').extendFields( () => {
      return _.set( {}, 'metaData', {
        type: new GraphQLList( entityMetaData ),
        args: { path: { type: GraphQLString } },
        resolve: (root:any, args:any, context:any) => this.resolve( root, args, context )
      });
    });
  }

  protected resolve( root:any, args:any, context:any ):Entity[] {
    const path = _.get( args, 'path' );
    return path ?
      _.filter( this.context.entities, entity => entity.path === path ) :
      _.values( this.context.entities );
  }

  protected resolveFields( root:any ):any[]{
    const entity = root as Entity;
    return _.map( entity.attributes, (attribute, name) => ({
      name, type: attribute.graphqlType, required: attribute.required, virtual: attribute.virtual,
      unique: _.toString(attribute.unique), filter: attribute.filterType }));
  }

  resolveAssocTo( root:any ) {
    const entity = root as Entity;
    return _.map( entity.assocTo, assocTo => {
      const refEntity = this.context.entities[assocTo.type];
      return { path: refEntity.path, query: refEntity.singular };
    });
  }

  resolveAssocToMany( root:any ) {
    const entity = root as Entity;
    return _.map( entity.assocToMany, assocToMany => {
      const refEntity = this.context.entities[assocToMany.type];
      return { path: refEntity.path, query: refEntity.plural };
    });
  }

  resolveAssocFrom( root:any ) {
    const entity = root as Entity;
    return _.map( entity.assocFrom, assocFrom => {
      const refEntity = this.context.entities[assocFrom.type];
      return { path: refEntity.path, query: refEntity.plural };
    });
  }

}
