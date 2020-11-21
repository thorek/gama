import _ from 'lodash';

import { EntityPermissionsType, PermissionRights, PrincipalType } from '../core/domain-configuration';
import { ResolverContext } from '../core/resolver-context';
import { Entity } from './entity';
import { EntityModule } from './entity-module';
import { CRUD } from './entity-resolver';


export class EntityPermissions extends EntityModule {

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
    const permission = await this.getPermissions( CRUD.READ, resolverCtx );
    if( permission === true ) return;
    if( permission === false ) return _.set( resolverCtx, 'filter', { id: [] } );

    const filter = _.get( resolverCtx.args, 'filter', {} );
    filter.id = _.union( filter.id, permission );
    _.set( resolverCtx, 'filter', filter );
  }

  private async ensurePermittedId( id:string, action:CRUD, resolverCtx:ResolverContext ) {
    const permission = await this.getPermissions( action, resolverCtx );
    if( permission === true ) return;
    if( ! permission || _.includes( permission, id ) ) throw new Error(`no entity '${this.entity.name}' with id '${id}'`);
  }

  private async getPermissions( action:CRUD, resolverCtx:ResolverContext ):Promise<boolean|string[]> {
    if( _.isUndefined( this.entity.permissions ) ) return true;

    const principal = this.getPrincipal( resolverCtx );
    if( ! principal || ! _.has( principal, 'roles' ) ) return false;
    return this.getPermissionByRoles( action, resolverCtx );
  }

  async getPermissionByRoles( action:CRUD, resolverCtx:ResolverContext ):Promise<boolean|string[]> {
    return _.isString( this.entity.permissions ) ?
      this.collectPermissionsFromDelegate(this.entity.permissions, action, resolverCtx ) :
      this.collectPermissionsFromRoles( action, resolverCtx );
  }

  private collectPermissionsFromRoles( action:CRUD, resolverCtx:ResolverContext ):boolean|string[]{
    if( ! this.entity.permissions || _.isString( this.entity.permissions) ) return false; // type ensure
    const principalRoles = this.getPrincipalRoles( resolverCtx );
    if( _.isBoolean(principalRoles) ) return false;
    const ids:string[] = [];
    if( _.find( this.entity.permissions, (roleDefinition, roleName ) => {
      if( ! _.includes( principalRoles, roleName ) ) return false;
      if( _.isFunction( roleDefinition ) ) roleDefinition = roleDefinition( resolverCtx, this.runtime );
      if( _.isBoolean( roleDefinition ) || _.isArray( roleDefinition ) ) return roleDefinition;

      if( _.find( roleDefinition, (actionDefinition, actions) => {
        if( _.isFunction( actionDefinition ) ) actionDefinition = actionDefinition( resolverCtx, this.runtime );
        return this.collectPermissionsFromAction( actionDefinition, actions, action, ids );
      })) return true;

    })) return true;
    return ids;
  }

  private collectPermissionsFromAction(actionDefinition:PermissionRights, actions:string, action:CRUD, ids:string[] ):boolean|undefined {
      if( ! _.includes( _.toLower( actions ), action ) ) return false;
      if( _.isBoolean( actionDefinition ) ) return actionDefinition;
      if( _.isArray( actionDefinition ) ) ids.push( ... actionDefinition );
  }

  private async collectPermissionsFromDelegate( delegate:string, action:CRUD, resolverCtx:ResolverContext):Promise<boolean|string[]> {
    const entitiy = this.runtime.entities[ delegate ];
    if( ! entitiy ) return false;
    const delegatePermissions = await entitiy.entityPermissions.getPermissionByRoles( action, resolverCtx );
    return _.isBoolean( delegatePermissions ) ?
      delegatePermissions :
      this.mapIdsFromPermissionDelegate( entitiy, delegatePermissions );
  }

  private async mapIdsFromPermissionDelegate( delegate:Entity, delegatePermissions:string[] ){
    const result = await this.entity.findByAttribute(_.set( {}, delegate.foreignKey, delegatePermissions ) );
    return _.map( result, ei => ei.id );
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
}
