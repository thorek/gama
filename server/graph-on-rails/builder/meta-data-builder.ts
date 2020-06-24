import { GraphQLList, GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLNonNull } from 'graphql';
import _, { entries } from 'lodash';

import { SchemaBuilder } from './schema-builder';
import { EntityAdmin } from 'graph-on-rails/entities/entity-admin';
import { E2BIG } from 'constants';

export class MetaDataBuilder extends SchemaBuilder {

  name() { return 'MetaData' }

  protected createObjectType():void {

    const AdmiFieldMetaData = new GraphQLObjectType({
      name: 'AdminFieldMetaData',
      fields: {
        name: {type: GraphQLNonNull( GraphQLString ) },
        label: {type: GraphQLNonNull( GraphQLString ) },
        filter: {type: GraphQLString },
        sortable: {type: GraphQLBoolean }
      }
    });

    const metaDataType = new GraphQLObjectType({
      name: 'metaData',
      fields: {
        name: { type: GraphQLString  },
        path: { type: GraphQLString },
        label: { type: GraphQLString },
        parent: { type: GraphQLString },
        typeQuery: { type: GraphQLString },
        typesQuery: { type: GraphQLString },
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

  protected resolve( root:any, args:any, context:any ):EntityAdmin[] {
    const path = _.get( args, 'path' );
    const entities = path ?
      _.filter( this.context.entities, entity => entity.admin.path === path ) :
      _.values( this.context.entities );

    return this.sort( _.map( entities, entity => entity.admin ) );
  }

  protected sort( eas:EntityAdmin[] ):EntityAdmin[] {
    return eas.sort( (ea1, ea2) => {
      if( ea1.orderNr && ea2.orderNr ) return ea1.orderNr - ea2.orderNr;
      if( ea1.orderNr || ea2.orderNr ) return ea1.orderNr ? 1 : -1;
      return ea1.name.localeCompare( ea2.name );
    });
  }
}
