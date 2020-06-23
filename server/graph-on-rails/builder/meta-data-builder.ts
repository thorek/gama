import { GraphQLList, GraphQLObjectType, GraphQLString, GraphQLBoolean } from 'graphql';
import _ from 'lodash';

import { SchemaBuilder } from './schema-builder';

export class MetaDataBuilder extends SchemaBuilder {

  name() { return "MetaData" }

  protected createObjectType(): void {
    const metaDataType = new GraphQLObjectType({
      name: 'metaData',
      fields: {
        name: { type: GraphQLString  },
        rootQuery: { type: GraphQLBoolean  },
        path: { type: GraphQLString },
        label: { type: GraphQLString },
        parent: { type: GraphQLString }
    }});

    this.graphx.type('query').extendFields( () => {
      return _.set( {}, 'metaData', {
        type: new GraphQLList( metaDataType ),
        resolve: (root:any, args:any, context:any) => _.values( this.context.entities )
			});
    });
  }
}
