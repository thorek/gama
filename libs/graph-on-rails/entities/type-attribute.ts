import { GraphQLType } from 'graphql';

//
export type TypeAttribute = {
  graphqlType:GraphQLType|string
  filterType?:string|false
  validation?:any
  unique?:string|boolean;
  required?:boolean|'create'|'update'
  description?:string
  // input?:boolean
  defaultValue?:any
  mediaType?:'image'|'video'|'audio'
  list?:boolean
  calculate?:( root?:any, args?:any, context?:any ) => any
}

