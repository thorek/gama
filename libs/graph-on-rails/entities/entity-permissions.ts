import _ from 'lodash';

import { JOIN } from '../core/data-store';
import { PermissionFilterFn, PrincipalType } from '../core/domain-configuration';
import { ResolverContext } from '../core/resolver-context';
import { EntityModule } from './entity-module';
import { CRUD } from './entity-resolver';


export class EntityPermissions extends EntityModule {

  get dataStore() { return this.runtime.dataStore } 


  async ensureTypeRead( resolverCtx:ResolverContext ) {
    const id = _.get( resolverCtx.args, 'id' );
    await this.ensurePermittedId( id, CRUD.READ, resolverCtx );
  }

  async ensureUpdate( resolverCtx:ResolverContext ){
    const id = _.get( resolverCtx.args, [this.entity.singular, 'id'] );
    await this.ensurePermittedId( id, CRUD.UPDATE, resolverCtx );
  }

  async ensureDelete( resolverCtx:ResolverContext ){
    const id = _.get( resolverCtx.args, 'id' );
    await this.ensurePermittedId( id, CRUD.DELETE, resolverCtx );
  }

  async ensureCreate( resolverCtx:ResolverContext ){
    const permission = await this.getPermissions( CRUD.CREATE, resolverCtx );
    if( permission === false ) throw new Error(`principal not allowed to create new item of '${this.entity.name}'`);
  }

  async ensureTypesRead( resolverCtx:ResolverContext ){
    const permissions = await this.getPermissions( CRUD.READ, resolverCtx );
    if( permissions === true ) return;
    if( ! permissions || _.isEmpty( permissions ) ) return _.set( resolverCtx.args, 'filter', { id: null } );

    const filter = _.get( resolverCtx.args, 'filter' );
    const permissionFilter = this.buildPermissionsFilter( resolverCtx, permissions );
    permissionFilter.push( ... filter );
    _.set( resolverCtx.args, 'filter', this.dataStore.joinFilter( permissionFilter, JOIN.AND ) );
  }

  private async ensurePermittedId( id:string, action:CRUD, resolverCtx:ResolverContext ) {
    const permissions = await this.getPermissions( action, resolverCtx );
    if( permissions === true ) return;
    if( ! permissions || _.isEmpty( permissions ) ) throw new Error(`action not permitted`);

    const permissionFilter = this.buildPermissionsFilter( resolverCtx, permissions );
    permissionFilter.push( { id } );
    const permittedItems = await this.dataStore.findByFilter(this.entity, permissionFilter );
    if( _.size( permittedItems ) === 0 ) throw new Error(`action not permitted for id '${id}'`)
  }

  private async getPermissions( action:CRUD, resolverCtx:ResolverContext ):Promise<boolean|PermissionFilterFn[]> {
    if( _.isUndefined( this.entity.permissions ) ) return true;

    const principal = this.getPrincipal( resolverCtx );
    if( ! principal || ! _.has( principal, 'roles' ) ) return false;

    return _.isString( this.entity.permissions ) ?
      this.getPermissionsFromDelegate(this.entity.permissions, action, resolverCtx ) :
      this.getPermissionFromEntityDefinition( action, resolverCtx );
  }

  private getPermissionFromEntityDefinition( action:CRUD, resolverCtx:ResolverContext ):boolean|PermissionFilterFn[] {
    if( ! this.entity.permissions || _.isString( this.entity.permissions) ) return false; // type ensure
    const principalRoles = this.getPrincipalRoles( resolverCtx );
    if( _.isBoolean(principalRoles) ) return principalRoles;

    const filter:PermissionFilterFn[] = [];
    if( _.find( this.entity.permissions, (roleDefinition, roleName ) => {
      if( ! _.includes( principalRoles, roleName ) ) return false;
      if( _.isBoolean( roleDefinition ) ) return roleDefinition;
      if( _.isFunction( roleDefinition ) ) return filter.push( roleDefinition ) && false;

      if( _.find( roleDefinition, (actionDefinition, actions) => {
        if( ! _.includes( _.toLower( actions ), action ) ) return false;
        if( _.isBoolean( actionDefinition ) ) return actionDefinition;
        if( _.isFunction( actionDefinition ) ) return filter.push( actionDefinition ) && false;
      })) return true;

    })) return true;
    return filter;
  }

  private async getPermissionsFromDelegate( delegate:string, action:CRUD, resolverCtx:ResolverContext):Promise<boolean|PermissionFilterFn[]> {
    const entity = this.runtime.entities[ delegate ];
    if( ! entity ) return false;

    const delegatePermissionIds = await entity.entityPermissions.getPermittedIds( action, resolverCtx );
    if( _.isBoolean( delegatePermissionIds ) ) return delegatePermissionIds;

    return [() => _.set({}, 'id', delegatePermissionIds )];
  }

  private async getPermittedIds( action:CRUD, resolverCtx:ResolverContext ):Promise<boolean|string[]>{
    const permissions = this.getPermissionFromEntityDefinition( action, resolverCtx );
    if( _.isBoolean( permissions ) ) return permissions;
    if( _.isEmpty( permissions ) ) return false;

    const filter = this.buildPermissionsFilter( resolverCtx, permissions );
    const permittedItems = await this.dataStore.findByFilter( this.entity, filter );
    return _.map( permittedItems, item => item.id );
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
    return principal;
  }

  private buildPermissionsFilter( resolverCtx: ResolverContext, permissions: PermissionFilterFn[] ) {
    const principal = this.getPrincipal( resolverCtx ) as PrincipalType;
    const permissionFilter = _.map( permissions, permission => permission( principal, resolverCtx, this.runtime ) );
    return permissionFilter;
  }

}
