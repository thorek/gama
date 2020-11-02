import { GraphQLType } from "graphql";
import { Runtime } from "./runtime";

export type DomainConfiguration = {
  entity?:{[name:string]:EntityConfig},
  enum?:{[name:string]:EnumConfig},
  query?:{[name:string]:QueryConfigFn},
  mutation?:{[name:string]:MutationConfigFn}
}

export type MutationConfig = {
  type: any
  args?:{[name:string]:object|string}
  resolve?: (root:any, args:any, context:any ) => any
}
export type MutationConfigFn = (runtime:Runtime) => MutationConfig|Promise<MutationConfig>;

export type QueryConfigFn = {
  query:(runtime:Runtime) => any;
}

/**
 *
 */
export type AttributeConfig = {
  type?:string;
  key?:string;
  filterType?:string|boolean;
  validation?:any;
  required?:boolean|'create'|'update'
  unique?:boolean|string
  description?:string
  input?:boolean
  default?:any

  label?:string
  list?:boolean
  sortable?:string
  mediaType?:'image'|'video'|'audio'

  calculate?:( root?:any, args?:any, context?:any ) => any
}

export type SeedEvalContextType = {
  idsMap?:any
  seed:any
  runtime:Runtime
}

export type SeedConfigType = {
  [attribute:string]:any|(( evalContext:SeedEvalContextType) => any)
}

export type EntityConfig  = {
  typeName?:string;

  attributes?:{[name:string]:string|AttributeConfig};
  assocTo?:string|(string|AssocToType)[];
  assocToMany?:string|(string|AssocToManyType)[];
  assocFrom?:string|string[]|AssocFromType[];

  plural?:string
  singular?:string;

  collection?:string;
  path?:string;

  seeds?:{[seedId:string]:SeedConfigType}|SeedConfigType[]
  permissions?:null|EntityPermissionType
  assign?:string

  union?:string[]
  interface?:boolean
  implements?:string|string[]

  description?:string
  extendEntity?:( runtime:Runtime ) => void | Promise<void>
}

export type EnumConfig = _.Dictionary<any>|(string[])

export type AssocType = {
  type:string
}

export type AssocFromType = AssocType & {
  delete?:'prevent'|'nullify'|'cascade'
}

export type AssocToType = AssocType & {
  required?:boolean
  delete?:'silent'|'cascade'
  input?:boolean
}

export type AssocToManyType = AssocToType & {
  scope?:string
}

export type CrudAction = 'read' | 'create' | 'update' | 'delete';

// export type EntityPermissionActionType =
//   boolean|
//   string|
//   {[condition:string]:object} |
//   {[query:string]:object} |
//   {[from:string]:string}

export type EntityPermissionRoleType =
  boolean|
  {[action in CrudAction|'*']?:boolean}

export type EntityPermissionType =
  {[role:string]:EntityPermissionRoleType}

