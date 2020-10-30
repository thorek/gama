import { AssocToType, CrudAction } from '../core/domain-configuration';
import _ from 'lodash';

import { ResolverContext } from '../core/resolver-context';
import { Entity } from './entity';
import { EntityModule } from './entity-module';


/**
 *  TODO refactor
 *  it was wrong to assume the allowed values and the "default restrictions" could be done simultaneously
 *  permissions should
 *  1. allow / disallow action on entity (role based)
 *  2. add additional "filter" to remove unallowed items - based on the loaded item
 *
 *  Another definition should decide about the "select" of entities
 */
export class EntityPermissions extends EntityModule {


  /**
   *
   */
  async isAllowed( action:CrudAction, roles?:string[] ):Promise<boolean> {
    if( this.skipPermissionCheck( roles ) ) return true;
    return  _.some( roles, role => this.isAllowedForRole( action, role ) );
  }

  /**
   *
   */
  private skipPermissionCheck( roles?:string[] ):boolean {
    if( ! this.isUserAndRolesDefined() ) return true;
    if( ! this.entity.permissions ) return true;
    if( ! roles ) return true;
    return false;
  }

  /**
   *
   */
  private isAllowedForRole( action:CrudAction, role:string ):boolean {
    const rolePermissions = _.get( this.entity.permissions, role );
    if( _.isUndefined(rolePermissions) ) return false;
    if( _.isBoolean( rolePermissions ) ) return rolePermissions;
    const actionPermission = _.get( rolePermissions, action );
    return _.isBoolean( actionPermission ) ? actionPermission : true;
  }


  /** ************************************************************************************************************ */

  async addPermissionToFilter( resolverCtx:ResolverContext ) {
    const filter = _.get( resolverCtx.args, 'filter', {} );
    // _.set( filter, 'id', this.getAssignedIds( resolverCtx ) );
    _.set( resolverCtx.args, 'filter', filter );
  }

  async getAssignedIds( resolverCtx:ResolverContext ):Promise<undefined|string[]> {
    if( ! this.entity.assign ) return undefined;
    const assocTo = _.find( this.entity.assocTo, assocTo => assocTo.type === this.entity.assign );
    if( assocTo ) return this.getAssignedIdsFromAssoc( assocTo, resolverCtx );
    return this.getAssignedIdsFromUser( resolverCtx );
  }

  private async getAssignedIdsFromAssoc( assoc:AssocToType, resolverCtx:ResolverContext ):Promise<string[]>{
    const entity = this.runtime.entities[assoc.type];
    if( ! entity ) throw new Error(`unknown type '${assoc.type}'`);
    const ids = await entity.entityPermissions.getAssignedIds( resolverCtx );
    const items = await this.entity.accessor.findByAttribute( _.set( {}, entity.foreignKey, ids ) );
    return _.map( items, item => item.id );
  }

  private async getAssignedIdsFromUser( resolverCtx:ResolverContext ):Promise<string[]>{
    if( ! this.entity.assign ) throw new Error(`no assign provided`);
    if( ! this.runtime.contextUser ) throw new Error(`no contextUser provided`);
    const user = _.get( resolverCtx.context, this.runtime.contextUser );
    if( ! user ) throw new Error(`no such contextUser '${this.runtime.contextUser}'`);
    return _.get( user, this.entity.assign );
  }


  /**
   * Will return `true`
   *   * if no user/roles definition is present in resolver context
   *   * the entity definition has no permission definition
   *
   * @return array of ids, that are allowed to access or true (everything), false (nothing) is allowed
   */
  async getPermittedIds( action:CrudAction, resolverCtx:ResolverContext ):Promise<boolean|number[]> {
    if( ! this.isUserAndRolesDefined() ) return true;
    if( ! this.entity.permissions ) return true;
    const user = _.get( resolverCtx.context, this.runtime.contextUser as string );
    const roles = this.getUserRoles( user );
    let ids:number[] = [];
    for( const role of roles ){
      const roleIds = await this.getPermittedIdsForRole( role, action, resolverCtx );
      if( roleIds === true ) return true;
      if( roleIds ) ids = _.concat( ids, roleIds );
    }
    return _.uniq( ids );
  }

  /**
   * @returns true if all items can be accessed, false when none, or the array of ObjectIDs that accessible items must match
   */
  protected async getPermittedIdsForRole( role:string, action:CrudAction, resolverCtx:ResolverContext ):Promise<boolean|number[]> {
    let permissions = this.getActionPermissionsForRole( role, action );
    if( _.isBoolean( permissions ) ) return permissions;
    if( _.isString( permissions ) ) return await this.getPermittedIdsForRole( permissions, action, resolverCtx );
    let ids:number[][] = [];
    for( const permission of permissions as (string|object)[] ){
      const actionIds = await this.getIdsForActionPermission( role, permission, resolverCtx );
      if( _.isBoolean( actionIds) ) {
        if( actionIds === false ) return false;
      } else ids.push( actionIds );
    }
    return _.intersection( ...ids );
  }

  /**
   *  @param permission if this is a string it will be handled as a reference to an action for the role
   *  in this or a assocTo entity. If it is an object it is delegated to the resolver to use to return the
   *  permitted ids
   */
  protected async getIdsForActionPermission( role:string, permission:string|object, resolverCtx:ResolverContext ):Promise<boolean|number[]> {
    if( _.isString( permission ) ) return await this.getIdsForReference( role, permission, resolverCtx );
    return this.resolvePermittedIds( permission, resolverCtx );
  }

  /**
   *
   */
  private async resolvePermittedIds( permission:object, resolverCtx:ResolverContext ):Promise<boolean|number[]>{
    try {
      'return await this.entity.resolver.getPermittedIds( this.entity, permission, resolverCtx );'
    } catch (error) {
      console.error(`'${this.entity.name}' resolver could not resolve permission`, permission, error);
    }
    return false;
  }

  /**
   *
   */
  protected async getIdsForReference( role:string, permissionReference:string, resolverCtx:ResolverContext ):Promise<boolean|number[]> {
    const entityAction = _.split( permissionReference, '.' );
    const action = _.last( entityAction ) as string;
    const entity = _.size( entityAction ) === 1 ? this.entity : this.getAssocToEntity( _.first( entityAction ) );
    return entity ? this.resolvePermittedIdsForAssocTo( entity, role, action, resolverCtx ) : false;
  }

  /**
   *
   */
  private async resolvePermittedIdsForAssocTo( entity:Entity, role:string, action:string, resolverCtx:ResolverContext ):Promise<boolean|number[]>{
    const ids = await entity.entityPermissions.getPermittedIdsForRole( role, action as CrudAction, resolverCtx );
    if( _.isBoolean( ids ) ) return ids;
    try {
      'return await this.entity.resolver.getPermittedIdsForForeignKeys( this.entity, entity.foreignKey, ids );'
    } catch (error) {
      console.error(`'${this.entity.typeName}' resolver could not resolve permission for foreign keys for`,
        entity.foreignKey, error);
    }
    return false;
  }

  /**
   *
   */
  protected getAssocToEntity( entity:undefined|string ):null|Entity {
    const entityIsAssocTo = _.find( this.entity.assocTo, refEntity => refEntity.type === entity );
    if( entityIsAssocTo ) return this.runtime.entities[ entity as string ];
    console.warn(`'${entity}' is not a assocTo of '${this.entity.name}'`);
    return null;
  }

  /**
   *  everything defined for a role, can depend on the action or can be defined for all actions
   *
   *  @param role a role of the user
   *  @param action either create, read, update, delete
   *  @returns
   *    boolean - all allowed / unallowed
   *
   *    string - another role in this permissions to get the permitted ids
   *
   *    (string|object)[] - string - get permissions from action in this or a assocTo entity for the same role
   *                      - object - create filter for query as described below
   *
   *  ### Filter for query:
   *  ```
   *    attributeA: value
   *  ```
   *  becomes `{ attributeA: { $eq: value } }`
   *
   *  ---
   *
   *  ```
   *    attributeB:
   *      - value1
   *      - value2
   *      - value3
   *  ```
   *  becomes `{ attributeB: { $in [value1, value2, value3] } }`
   *
   *
   *  ### Examples
   *  ```
   *  entity:
   *    Contract:
   *      attributes:
   *        name: string
   *        status: string
   *      assocTo:
   *        - Car
   *      permissions:
   *        admin: true                 # all actions, everything permitted
   *        guest: false                # all actions, nothing permitted
   *        user: admin                 # all actions the same as for role 'admin'
   *        roleA:
   *          all: true                 # all actions, everything permitted, same as roleA: true
   *        roleB:
   *          all: false                # all actions, nothing permitted - same as roleB: false, pointless
   *          read: true                # except reading is allowed
   *        roleC:
   *          read: true                # reading of all items allowed
   *          create: read              # same as read
   *          update: read              # same as read
   *          delete: false             # no items allowed to delete
   *        roleD:
   *          all:
   *            name: 'Example'
   *          delete: roleC
   *        roleE:
   *          all:
   *            - name: 'Example'
   *        roleF:
   *          read:
   *            - name: 'Example'
   *              status: 'open'
   *          all:
   *            - read
   *            - status:
   *              - draft
   *              - open
   *              name: user.assignedContracts  # will be resolved with context
   *        roleG:
   *          all:
   *            name:
   *              - Example1
   *              - Example2
   *            status:
   *              - open
   *              - draft
   *        roleH:
   *          all: Car.read             # same as in Car.permissions.roleD.read (Car must be a assocTo)
   *                                    # permisions in Car could also delegate to another assocTo entity
   *        roleI:
   *          create: false
   *          all:
   *            name: 'Example'         # read, update, delete allowed for all items with { name: { $eq: "Example" } }
   *        roleJ:
   *          all:
   *            - Car.read               # all actions same as defined in Car.read
   *            - name: 'Example'        # and all items with { name: { $eq: "Example" } }
   *        roleK:
   *          all:
   *            - filter: '{ $and: { name: { $eq: "foo", $neq: "bar" }, { status: { $in officialStatus }} }}'
   * ```
   *
   */
  private getActionPermissionsForRole(role:string, action:CrudAction):boolean | string | (string|object)[]  {
    const permissions = _.get( this.entity.permissions, role );
    if( _.isBoolean( permissions ) || _.isString( permissions ) ) return permissions;
    let actionPermission = _.get( permissions, action );
    if( ! actionPermission ) actionPermission = _.get( permissions, 'all' );
    if( ! actionPermission ) return false;
    if( _.isBoolean( actionPermission ) ) return actionPermission;
    if( _.isArray( actionPermission ) ) return actionPermission;
    if( _.isObject( actionPermission ) || _.isString( actionPermission) ) return [actionPermission];
    console.warn(`unexpected permission for role '${role}', action '${action}'`, actionPermission );
    return false;
  }

  /**
   *
   */
  protected isUserAndRolesDefined():boolean {
    return this.runtime.contextUser != null && this.runtime.contextRoles != null;
  }

  /**
   *
   */
  protected getUserRoles( user:string ):string[] {
    if( ! user ) throw 'should not happen, no user in context';
    let roles:any = _.get( user, this.runtime.contextRoles as string );
    if( ! roles ) throw new Error( `User has no role - ${JSON.stringify( user ) }` );
    return _.isArray( roles ) ? roles : [roles];
  }

}
