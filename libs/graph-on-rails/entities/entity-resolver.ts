import _ from 'lodash';

import { Sort } from '../core/data-store';
import {
  AfterResolverHook,
  AttributeResolveContext,
  PreResolverHook,
  PrincipalType,
  ResolverContext,
  ResolverHookContext,
} from '../core/domain-configuration';
import { Entity } from './entity';
import { FileInfo } from './entity-file-save';
import { EntityItem } from './entity-item';
import { EntityModule } from './entity-module';

export enum CRUD  {
  CREATE = 'create',
  READ = 'read',
  UPDATE= 'update',
  DELETE = 'delete'
}


//
//
export class EntityResolver extends EntityModule {

  get accessor() { return this.entity.accessor }
  get hooks() { return this.entity.hooks }
  get permissions() { return this.entity.entityPermissions }

  async resolveType( resolverCtx:ResolverContext ):Promise<any> {
    const impl = async (resolverCtx:ResolverContext) => {
      const id = _.get( resolverCtx.args, 'id' );
      this.permissions.ensureTypeRead( id, resolverCtx );
      const enit = await this.accessor.findById( id );
      return this.applyAttributeResolver( enit.item, resolverCtx );
    };
    return this.callWithHooks( impl, resolverCtx, this.hooks?.preTypeQuery, this.hooks?.afterTypeQuery );
  }

  async resolveTypes( resolverCtx:ResolverContext ):Promise<any[]> {
    const impl = async (resolverCtx:ResolverContext) => {
      await this.permissions.ensureTypesRead( resolverCtx );
      const filter = _.get( resolverCtx.args, 'filter');
      const sort = this.getSort( _.get( resolverCtx.args, 'sort') );
      const paging = _.get( resolverCtx.args, 'paging');
      const enits = await this.accessor.findByFilter( filter, sort, paging );
      return await Promise.all(
        _.map( enits, enit => this.applyAttributeResolver( enit.item, resolverCtx ) ) );
    };
    return this.callWithHooks( impl, resolverCtx, this.entity.hooks?.preTypesQuery, this.entity.hooks?.afterTypesQuery );
  }

  async saveType( resolverCtx:ResolverContext ):Promise<any> {
    const impl = async (resolverCtx:ResolverContext) => {
      await this.permissions.ensureSave( resolverCtx );
      const attributes = _.get( resolverCtx.args, this.entity.singular );
      const fileInfos = await this.setFileValuesAndGetFileInfos( resolverCtx.args, attributes );
      const result = await this.accessor.save( attributes );
      if( result instanceof EntityItem ) {
        this.saveFiles( result.item.id, fileInfos );
        return _.set( {validationViolations: []}, this.entity.singular, result.item );
      }
      return { validationViolations: result };
    };
    return this.callWithHooks( impl, resolverCtx, this.entity.hooks?.preSave, this.entity.hooks?.afterSave );
  }

  async deleteType( resolverCtx:ResolverContext ):Promise<string[]> {
    const impl = async (resolverCtx:ResolverContext) => {
      await this.permissions.ensureDelete( resolverCtx );
      const id = resolverCtx.args.id;
      try { await this.accessor.delete( id ) } catch (error){ return [ 'Error', _.toString(error)] }
      try { await this.entity.fileSave.deleteFiles( id ) } catch (error) { return ['Error', _.toString(error)] }
      return [];
    };
    return this.callWithHooks( impl, resolverCtx, this.entity.hooks?.preSave, this.entity.hooks?.afterSave );
  }

  async resolveAssocToType( refEntity:Entity, resolverCtx:ResolverContext ):Promise<any> {
    const id = _.get( resolverCtx.root, refEntity.foreignKey );
    if( _.isNil(id) ) return null;
    if( refEntity.isPolymorph ) return this.resolvePolymorphAssocTo( refEntity, resolverCtx, id );
    if( ! await refEntity.entityPermissions.isIdPermitted( id, CRUD.READ, resolverCtx ) ) return null;
    const enit = await refEntity.findById( id );
    return enit.item;
  }

  async resolveAssocToManyTypes( refEntity:Entity, resolverCtx:ResolverContext ):Promise<any> {
    if( refEntity.isPolymorph ) return this.resolvePolymorphAssocToMany( refEntity, resolverCtx );
    const ids = _.map( _.get( resolverCtx.root, refEntity.foreignKeys ), id => _.toString(id) );
    await refEntity.entityPermissions.ensureTypeRead( ids, resolverCtx );
    const enits = await refEntity.findByIds( ids );
    return _.map( enits, enit => enit.item );
  }

  async resolveAssocFromTypes( refEntity:Entity, resolverCtx:ResolverContext ):Promise<any[]> {
    const id = _.toString(resolverCtx.root.id);
    const fieldName = refEntity.isAssocToMany( this.entity ) ? this.entity.foreignKeys : this.entity.foreignKey;
    if( refEntity.isPolymorph ) return this.resolvePolymorphAssocFromTypes( refEntity, fieldName, id, resolverCtx );
    const filter = _.set( {}, fieldName, id );
    await refEntity.entityPermissions.addPermissionToFilter( filter, resolverCtx );
    const enits = await refEntity.accessor.findByFilter( filter );
    return _.map( enits, enit => enit.item );
  }

  async resolveStats( resolverCtx:ResolverContext ):Promise<any> {
    await this.permissions.ensureTypesRead( resolverCtx );
    const filter = _.get( resolverCtx.args, 'filter');
    const enits = await this.accessor.findByFilter( filter );
    const createdFirst = _.get( _.minBy( enits, enit => enit.item['createdAt'] ), 'item.createdAt' );
    const createdLast = _.get( _.maxBy( enits, enit => enit.item['createdAt'] ), 'item.createdAt' );
    const updatedLast = _.get( _.maxBy( enits, enit => enit.item['updatedAt'] ), 'item.updatedAt' );
    return { count: _.size( enits ), createdFirst, createdLast, updatedLast };
  }

  private async callWithHooks(
      impl:Function,
      resolverCtx:ResolverContext,
      preHook?:PreResolverHook,
      afterHook?:AfterResolverHook ):Promise<any>{
    let resolved = _.isFunction( preHook ) ?
      Promise.resolve( preHook( this.getResolverHookContext( resolverCtx ) ) ) : undefined;
    if( _.isObject(resolved) ) return resolved;
    resolved = impl( resolverCtx );
    return _.isFunction( afterHook ) ?
      Promise.resolve( afterHook( resolved, this.getResolverHookContext( resolverCtx ) ) ) : resolved;
  }

  private getResolverHookContext( resolverCtx:ResolverContext ):ResolverHookContext {
    const principal = this.getPrincipal( resolverCtx );
    return { resolverCtx, principal, runtime: this.runtime };
  }

  private getSort( sortString: string ):Sort|undefined {
    if( ! sortString ) return undefined;
    const parts = _.split( sortString, '_' );
    if( parts.length !== 2 ) return this.warn( `invalid sortString '${sortString}'`, undefined );
    const field = _.first( parts) as string;
    const direction = _.last( parts ) as 'ASC'|'DESC';
    if( _.includes( ['ASC', 'DESC'], direction) ) return { field, direction };
    this.warn(`invalid direction '${direction}'`, undefined);
  }

  /**
   * leave it here - to refernce not used anymore - am not about it though
   */
  private async resolvePolymorphTypes( filter:any, sort?:Sort ):Promise<any[]> {
    const result = [];
    for( const entity of this.entity.entities ){
      const enits = await entity.accessor.findByFilter( filter );
      _.forEach( enits, enit => _.set(enit.item, '__typename', entity.typeName ) );
      result.push( enits );
    }
    return _(result).flatten().compact().map( enit => enit.item ).value();
  }

  private async resolvePolymorphAssocTo( refEntity:Entity, resolverCtx:ResolverContext, id:any ):Promise<any> {
    const polymorphType = this.runtime.entities[_.get( resolverCtx.root, refEntity.typeField )];
    if( ! await polymorphType.entityPermissions.isIdPermitted( id, CRUD.READ, resolverCtx ) ) return ;
    const enit = await polymorphType.findById( id );
    _.set( enit.item, '__typename', polymorphType.typeName );
    return enit.item;
  }

  private async resolvePolymorphAssocToMany( refEntity:Entity, resolverCtx:ResolverContext ):Promise<any> {
    throw 'not implemented';
  }

  private async resolvePolymorphAssocFromTypes(refEntity:Entity, fieldName:string, id:string, resolverCtx:ResolverContext ):Promise<any[]> {
    const result = [];
    for( const entity of refEntity.entities ){
      const filter = _.set( {}, fieldName, id );
      refEntity.entityPermissions.addPermissionToFilter( filter, resolverCtx );
      const enits = await refEntity.accessor.findByFilter( filter );
      _.forEach( enits, enit => _.set(enit.item, '__typename', entity.typeName ) );
      result.push( enits );
    }
    return _(result).flatten().compact().map( enit => enit.item ).value();
  }

  private async setFileValuesAndGetFileInfos( args:any, attributes:any ):Promise<FileInfo[]> {
    const fileInfos:FileInfo[] = [];
    for( const name of _.keys( this.entity.attributes ) ){
      const attribute = this.entity.attributes[name];
      if( ! this.entity.isFileAttribute( attribute ) ) continue;
      const fileInfo = await this.setFileValuesAndGetFileInfo( name, args, attributes )
      if( fileInfo ) fileInfos.push( fileInfo );
    }
    return fileInfos;
  }

  private async setFileValuesAndGetFileInfo( name:string, args:any, attributes:any ):Promise<FileInfo|undefined>{
    const filePromise = _.get( args, name );
    if( ! filePromise ) return;
    return new Promise( resolve => Promise.resolve(filePromise).then( value => {
      value.filename = this.entity.fileSave.sanitizeFilename( value.filename );
      _.set( attributes, name, _.pick(value, 'filename', 'encoding', 'mimetype') );
      resolve({ name, filename: _.get(value, 'filename'), stream: value.createReadStream() });
    }));
  }

  private async saveFiles( id:string, fileInfos:FileInfo[]  ):Promise<void> {
    for( const fileInfo of fileInfos ) await this.entity.fileSave.saveFile( id, fileInfo );
  }

    //
  //
  private async applyAttributeResolver( item:any, resolverCtx:ResolverContext  ):Promise<any>{
    for( const name of _.keys( this.entity.attributes ) ){
      const attribute = this.entity.attributes[name];
      if( ! _.isFunction(attribute.resolve) ) continue;
      const principal = this.getPrincipal( resolverCtx );
      const arc:AttributeResolveContext = { item, resolverCtx, principal, runtime: this.runtime };
      const value = await Promise.resolve( attribute.resolve( arc ) );
      Object.defineProperty( item, name, { value } )
    }
    return item;
  }

  private getPrincipal( resolverCtx:ResolverContext ):PrincipalType|undefined {
    const principal:PrincipalType = _.get(resolverCtx, 'context.principal');
    return _.isFunction( principal ) ? principal( this.runtime, resolverCtx ) : principal;
  }


}
