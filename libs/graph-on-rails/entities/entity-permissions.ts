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
    const expression = await this.buildPermissionsExpression( resolverCtx, permissions );
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

    const expression = await this.buildPermissionsExpression( resolverCtx, permissions );
    const permittedItems = await this.dataStore.findByFilter( this.entity, { expression } );
    return _.map( permittedItems, item => item.id );
  }

  private async ensureCreate( resolverCtx:ResolverContext ){
    const permission = await this.getPermissions( CRUD.CREATE, resolverCtx );
    if( permission === false ) throw new Error(`principal not allowed to create new item of '${this.entity.name}'`);
  }

  private async ensureUpdate( resolverCtx:ResolverContext ){
    const id = _.get( resolverCtx.args, [this.entity.singular, 'id'] );
    await this.ensurePermittedId( id, CRUD.UPDATE, resolverCtx );
  }

  private async ensurePermittedId( id:string, action:CRUD, resolverCtx:ResolverContext ) {
    const permissions = await this.getPermissions( action, resolverCtx );
    if( permissions === true ) return;
    if( ! permissions || _.isEmpty( permissions ) ) throw new Error(`action not permitted`);

    const expression = await this.buildPermissionsExpression( resolverCtx, permissions );
    const filter = { expression, id };
    const permittedItems = await this.dataStore.findByFilter(this.entity, filter );
    if( _.size( permittedItems ) === 0 ) throw new Error(`action not permitted for id '${id}'`)
  }

  private async getPermissions( action:CRUD, resolverCtx:ResolverContext ):Promise<boolean|PermissionExpression[]> {
    if( _.isUndefined( this.entity.permissions ) ) return true;
    if( ! this.getPrincipalRoles( resolverCtx ) ) return false;

    return _.isString( this.entity.permissions ) ?
      this.getPermissionsFromDelegate(this.entity.permissions, action, resolverCtx ) :
      this.getPermissionFromEntityDefinition( action, resolverCtx );
  }

  private getPermissionFromEntityDefinition( action:CRUD, resolverCtx:ResolverContext ):boolean|PermissionExpression[] {
    if( ! this.entity.permissions || _.isString( this.entity.permissions) ) return false; // type ensure
    const principalRoles = this.getPrincipalRoles( resolverCtx );
    if( _.isBoolean(principalRoles) ) return principalRoles;

    const filter:PermissionExpression[] = [];
    if( _.find( this.entity.permissions, (roleDefinition, roleName ) => {
      if( ! _.includes( principalRoles, roleName ) ) return false;
      if( _.isBoolean( roleDefinition ) ) return roleDefinition;
      if( _.isFunction( roleDefinition ) ) return filter.push( roleDefinition ) && false;
      if( _.isString( roleDefinition ) ) return filter.push( roleDefinition ) && false;

      if( _.find( roleDefinition, (actionDefinition, actions) => {
        if( ! _.includes( _.toLower( actions ), action ) ) return false;
        if( _.isBoolean( actionDefinition ) ) return actionDefinition;
        if( _.isFunction( actionDefinition ) ) return filter.push( actionDefinition ) && false;
      })) return true;

    })) return true;
    return filter;
  }

  private async getPermissionsFromDelegate( delegate:string, action:CRUD, resolverCtx:ResolverContext):Promise<boolean|PermissionExpressionFn[]> {
    const entity = this.runtime.entities[ delegate ];
    if( ! entity ) return false;

    const delegatePermissionIds = await entity.entityPermissions.getPermittedIds( action, resolverCtx );
    if( _.isBoolean( delegatePermissionIds ) ) return delegatePermissionIds;

    return [() => _.set({}, 'id', delegatePermissionIds )];
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

  private async buildPermissionsExpression( resolverCtx: ResolverContext, permissions: PermissionExpression[] ):Promise<any> {
    const principal = this.getPrincipal( resolverCtx ) as PrincipalType;
    const expressions = await Promise.all( _.map( permissions, permission =>
      _.isString( permission ) ?
        this.runtime.dataStore.buildExpressionFromFilter( this.entity, { id: permission } ) :
        Promise.resolve( permission( principal, resolverCtx, this.runtime ) ) ) );
    return this.runtime.dataStore.joinExpressions( expressions, 'or' );
  }

}
