import { GraphQLType } from 'graphql';
import { FilterType } from '../builder/filter-type';

//
export type TypeAttribute = {
  graphqlType:GraphQLType|string
  filterType?:FilterType|string|false
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

