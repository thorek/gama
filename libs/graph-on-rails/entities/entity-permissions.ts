import _ from 'lodash';

import { PermissionExpression, PermissionExpressionFn, PrincipalType } from '../core/domain-configuration';
import { ResolverContext } from '../core/resolver-context';
import { EntityModule } from './entity-module';
import { CRUD } from './entity-resolver';

export interface EntityPermissions  {

  ensureTypeRead( id:string|string[], resolverCtx:ResolverContext ):Promise<void>

  ensureTypesRead( resolverCtx:ResolverContext ):Promise<void>

  ensureSave( resolverCtx:ResolverContext ):Promise<void>

  ensureDelete( resolverCtx:ResolverContext ):Promise<void>

  getPermittedIds( action:CRUD, resolverCtx:ResolverContext ):Promise<boolean|string[]>
}

export class DefaultEntityPermissions extends EntityModule implements EntityPermissions {

  get dataStore() { return this.runtime.dataStore }

  async ensureTypeRead( ids:string|string[], resolverCtx:ResolverContext ) {
    if( ! _.isArray( ids ) ) ids = [ids];
    await Promise.all( _.map( ids, id => this.ensurePermittedId( id, CRUD.READ, resolverCtx ) ) );
  }

  async ensureTypesRead( resolverCtx:ResolverContext ){
    const permissions = await this.getPermissions( CRUD.READ, resolverCtx );
    if( permissions === true ) return;
    if( ! permissions || _.isEmpty( permissions ) ) return _.set( resolverCtx.args, 'filter', { id: null } );

    const filter = _.get( resolverCtx.args, 'filter', {} );
    const expression = this.runtime.dataStore.joinExpressions( permissions, 'or' );
    _.set( filter, 'expression', expression );
    _.set( resolverCtx.args, 'filter', filter );
  }

  ensureSave( resolverCtx:ResolverContext ){
    const id =_.get( resolverCtx.args, [this.entity.singular, 'id'] );
    return id ? this.ensureUpdate( resolverCtx ) : this.ensureCreate( resolverCtx );
  }

  async ensureDelete( resolverCtx:ResolverContext ){
    const id = _.get( resolverCtx.args, 'id' );
    await this.ensurePermittedId( id, CRUD.DELETE, resolverCtx );
  }

  async getPermittedIds( action:CRUD, resolverCtx:ResolverContext ):Promise<boolean|string[]>{
    const permissions = await this.getPermissions( action, resolverCtx );
    if( _.isBoolean( permissions ) ) return permissions;
    if( _.isEmpty( permissions ) ) return false;

    const expression = this.runtime.dataStore.joinExpressions( permissions, 'or' );
    const permittedItems = await this.dataStore.findByFilter( this.entity, { expression } );
    return _.map( permittedItems, item => item.id );
  }

  private async ensureCreate( resolverCtx:ResolverContext ){
    const permissions = await this.getPermissions( CRUD.CREATE, resolverCtx );
    if( permissions === true ) return;
    if( permissions === false ) throw new Error(`principal not allowed to create new item of '${this.entity.name}'`);
    const expression = this.runtime.dataStore.joinExpressions( permissions, 'or' );
    const item =_.get( resolverCtx.args, [this.entity.singular] );
    if( ! await this.dataStore.itemMatchesExpression( item, expression ) )
      throw new Error(`principal not allowed to create this item of '${this.entity.name}'`);
  }

  private async ensureUpdate( resolverCtx:ResolverContext ){
    const permissions = await this.getPermissions( CRUD.CREATE, resolverCtx );
    if( permissions === true ) return;
    if( permissions === false ) throw new Error(`principal not allowed to create new item of '${this.entity.name}'`);
    const expression = this.runtime.dataStore.joinExpressions( permissions, 'or' );
    const item =_.get( resolverCtx.args, [this.entity.singular] );
    if( ! await this.dataStore.itemMatchesExpression( item, expression ) )
    throw new Error(`principal not allowed to update this item of '${this.entity.name}'`);

    const id = _.get( resolverCtx.args, [this.entity.singular, 'id'] );
    const filter = { expression, id };
    const permittedItems = await this.dataStore.findByFilter(this.entity, filter );
    if( _.size( permittedItems ) === 0 ) throw new Error(`action not permitted for id '${id}'`)
  }

  private async ensurePermittedId( id:string, action:CRUD, resolverCtx:ResolverContext ) {
    const permissions = await this.getPermissions( action, resolverCtx );
    if( permissions === true ) return;
    if( ! permissions || _.isEmpty( permissions ) ) throw new Error(`action not permitted`);

    const expression = this.runtime.dataStore.joinExpressions( permissions, 'or' );
    const filter = { expression, id };
    const permittedItems = await this.dataStore.findByFilter(this.entity, filter );
    if( _.size( permittedItems ) === 0 ) throw new Error(`action not permitted for id '${id}'`)
  }

  private async getPermissions( action:CRUD, resolverCtx:ResolverContext ):Promise<boolean|PermissionExpression[]> {
    if( _.isUndefined( this.entity.permissions ) ) return true;
    const principalRoles = this.getPrincipalRoles( resolverCtx );
    if( _.isBoolean(principalRoles) ) return principalRoles;

    return _.isString( this.entity.permissions ) ?
      await this.getPermissionsFromDelegate(this.entity.permissions, action, resolverCtx ) :
      await this.getPermissionFromEntityDefinition( action, resolverCtx );
  }

  private async getPermissionFromEntityDefinition( action:CRUD, resolverCtx:ResolverContext ):Promise<boolean|PermissionExpression[]>{
    if( ! this.entity.permissions || _.isString( this.entity.permissions) ) return false; // type ensure
    const principalRoles = this.getPrincipalRoles( resolverCtx );
    if( _.isBoolean(principalRoles) ) return principalRoles;  // type ensure
    const roles = _.intersection( principalRoles, _.keys( this.entity.permissions ) );
    return this.getPermissionsFromRoleDefinitions( roles, action, resolverCtx );
  }

  private async getPermissionsFromRoleDefinitions( roles:string[], action:CRUD, resolverCtx:ResolverContext):Promise<boolean|PermissionExpression[]>{
    const expressions:PermissionExpression[] = [];
    for( const role of roles ){
      const roleDefinition = _.get(this.entity.permissions, [role] );
      if( ! roleDefinition ) continue;
      if( roleDefinition === true ) return true;
      if( _.isString( roleDefinition ) ){
        if( _.includes( roleDefinition, action ) ) return true;
        continue;
      }
      const foundTrue = await this.addExpressionsFromFns( expressions, roleDefinition, action, resolverCtx );
      if( foundTrue === true ) return true;
    }
    return expressions.length === 0 ? false : expressions;
  }

  private async addExpressionsFromFns( expressions:PermissionExpression[], expressionFns:Function|Function[], action:CRUD, resolverCtx:ResolverContext ):Promise<true|undefined>{
    const principal = this.getPrincipal( resolverCtx );
    if( ! _.isArray( expressionFns ) ) expressionFns = [expressionFns];
    for( const expressionFn of expressionFns ){
      const expression = await Promise.resolve( expressionFn( action, principal, resolverCtx, this.runtime ) );
      if( ! expression  ) continue;
      if( expression === true ) return true;
      expressions.push( expression );
    }
  }

  private async getPermissionsFromDelegate( delegate:string, action:CRUD, resolverCtx:ResolverContext):Promise<boolean|PermissionExpression[]> {
    const entity = this.runtime.entities[ delegate ];
    if( ! entity ) return false;
    const delegatePermissionIds = await entity.entityPermissions.getPermittedIds( action, resolverCtx );
    if( _.isBoolean( delegatePermissionIds ) ) return delegatePermissionIds;
    const ids = _.map( delegatePermissionIds , id => _.toString( id ) );
    const expression = await this.dataStore.buildExpressionFromFilter(
      this.entity, _.set({}, entity.foreignKey, ids ) )
    return [expression];
  }

  private getPrincipalRoles( resolverCtx:ResolverContext ):string[]|boolean{
    const principal = this.getPrincipal( resolverCtx );
    if( ! principal ) return false;
    const roles = _.isFunction( principal.roles ) ? principal.roles( this.runtime, resolverCtx ) : principal.roles;
    if( _.isBoolean( roles ) ) return roles;
    if( ! roles ) return [];
    return _.isArray( roles ) ? roles : [roles];
  }

  private getPrincipal( resolverCtx:ResolverContext ):PrincipalType|undefined {
    const principal:PrincipalType = _.get(resolverCtx, 'context.principal');
    return _.isFunction( principal ) ? principal( this.runtime, resolverCtx ) : principal;
  }

}
