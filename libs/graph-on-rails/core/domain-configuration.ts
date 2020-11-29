import { CRUD } from '../entities/entity-resolver';
import { ValidationViolation } from '../entities/entity-validation';
import { ResolverContext } from './resolver-context';
import { Runtime } from './runtime';

export type DomainConfiguration = {
  entity?:{[name:string]:EntityConfig},
  enum?:{[name:string]:EnumConfig},
  query?:{[name:string]:QueryConfigFn},
  mutation?:{[name:string]:MutationConfigFn},
}

export type EntityHooksType = {
  preSave?: ( ctx:ResolverContext ) => void|undefined|object
  afterSave?: ( resolved:any, ctx:ResolverContext ) => object
  preTypeQuery?: ( ctx:ResolverContext ) => void|undefined|object
  afterTypeQuery?: ( resolved:any, ctx:ResolverContext ) => object
  preTypesQuery?: ( ctx:ResolverContext ) => void|undefined|object
  afterTypesQuery?: ( resolved:any, ctx:ResolverContext ) => object
  preDelete?: ( ctx:ResolverContext ) => void|undefined|object
  afterDelete?: ( resolved:any, ctx:ResolverContext ) => object
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
  resolve?:( item:any, resolverCtx:ResolverContext, runtime:Runtime ) => any
}

export type SeedEvalContextType = {
  idsMap?:any
  seed:any
  runtime:Runtime
}

export type SeedAttributeType =
  any|
  (( evalContext:SeedEvalContextType) => any)|
  {eval: string, share?: number}

export type SeedType = {
  [attribute:string]:SeedAttributeType
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

  seeds?:{[seedId:string]:SeedType}|SeedType[]
  permissions?:string|EntityPermissionsType

  union?:string[]
  interface?:boolean
  implements?:string|string[]

  description?:string
  extendEntity?:( runtime:Runtime ) => void | Promise<void>
  validation?:( item:any, runtime:Runtime ) => ValidationReturnType
  hooks?:EntityHooksType
}

export type EntityPermissionsType = {
  [role:string]:boolean|PermissionExpressionFn|PermissionExpressionFn[]|string
}


export type PermissionExpressionFn = ( peCtx:PermissionExpressionContext) => Permission|Promise<Permission>
export type PermissionExpressionContext = {
  action:CRUD
  principal:PrincipalType
  role:string
  resolverCtx:ResolverContext,
  runtime:Runtime
}
export type Permission = undefined|boolean|PermissionExpression
export type PermissionExpression = object

export type PrincipalType = any | {
  roles?:PrincipalRolesType|PrincipalRolesTypeFn
}

export type PrincipalRolesType = undefined|boolean|string|string[]
export type PrincipalRolesTypeFn = ( runtime:Runtime, resolverContext:ResolverContext ) => PrincipalRolesType

export type ValidationReturnType =
  ValidationViolation|ValidationViolation[]|string|undefined|
  Promise<ValidationViolation|ValidationViolation[]|string|undefined>

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


