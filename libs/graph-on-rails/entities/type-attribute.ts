import { GraphQLType } from 'graphql';

import { AttributeResolveContext } from '../core/domain-configuration';

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
  resolve?:(arc:AttributeResolveContext) => any
  virtual?:boolean
}

