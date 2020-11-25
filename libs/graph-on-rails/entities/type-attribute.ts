import { ResolverContext } from 'core/resolver-context';
import { Runtime } from 'core/runtime';
import { GraphQLType } from 'graphql';

//
export type TypeAttribute = {
  graphqlType:GraphQLType|string
  filterType?:string|false
  validation?:any
  unique?:string|boolean;
  required?:boolean|'create'|'update'
  description?:string
  defaultValue?:any
  mediaType?:'image'|'video'|'audio'
  list?:boolean
  resolve?:( item:any, resolverCtx:ResolverContext, runtime:Runtime ) => any
}

