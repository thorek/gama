import { ValidationViolation } from '../entities/entity-validation';
import { Runtime } from './runtime';

export type DomainConfiguration = {
  entity?:{[name:string]:EntityConfig},
  enum?:{[name:string]:EnumConfig},
  query?:{[name:string]:QueryConfigFn},
  mutation?:{[name:string]:MutationConfigFn}
}

type QueryMutationArgConfig = { type: string|object }
export type QueryMutationConfig = {
  type: any
  args?:{[name:string]:string | QueryMutationArgConfig }
  resolve?: (root:any, args:any, context:any ) => any
}

export type MutationConfigFn = (runtime:Runtime) => QueryMutationConfig
export type QueryConfigFn = (runtime:Runtime) => QueryMutationConfig

/**
 *
 */
export type AttributeConfig = {
  type?:string;
  required?:boolean|'create'|'update'
  unique?:boolean|string
  description?:string
  list?:boolean
  default?:any
  filterType?:string|false
  validation?:object
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
  validation?:object|(( item:any, action:'create'|'update') => ValidationReturnType)
}

export type ValidationReturnType = ValidationViolation[]|string|undefined|Promise<ValidationViolation[]|string|undefined>

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

