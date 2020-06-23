import { GraphQLList, GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLNonNull } from 'graphql';
import _ from 'lodash';

import { SchemaBuilder } from './schema-builder';

export class MetaDataBuilder extends SchemaBuilder {

  name() { return 'MetaData' }

  protected createObjectType():void {

    const AdmiFieldMetaData = new GraphQLObjectType({
      name: 'AdminFieldMetaData',
      fields: {
        name: {type: GraphQLNonNull( GraphQLString ) },
        label: {type: GraphQLNonNull( GraphQLString ) },
        filter: {type: GraphQLString },
        sort: {type: GraphQLBoolean }
      }
    });

    const metaDataType = new GraphQLObjectType({
      name: 'metaData',
      fields: {
        name: { type: GraphQLString  },
        rootQuery: { type: GraphQLBoolean  },
        path: { type: GraphQLString },
        label: { type: GraphQLString },
        parent: { type: GraphQLString },
        fields: { type: GraphQLList( AdmiFieldMetaData ) }
    }});

    this.graphx.type('query').extendFields( () => {
      return _.set( {}, 'metaData', {
        type: new GraphQLList( metaDataType ),
        args: { path: { type: GraphQLString } },
        resolve: (root:any, args:any, context:any) => this.resolve( root, args, context )
      });
    });
  }

  protected resolve( root:any, args:any, context:any ):any[] {
    const path = _.get( args, 'path' );
    const entities = path ?
      _.filter( this.context.entities, entity => entity.admin.path === path ) :
      _.values( this.context.entities );

    return _.map( entities, entity => entity.admin );
  }
}
