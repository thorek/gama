import _ from 'lodash';

import { Sort } from '../core/data-store';
import { ResolverContext } from '../core/resolver-context';
import { Entity } from './entity';
import { FileInfo } from './entity-file-save';
import { EntityItem } from './entity-item';
import { EntityModule } from './entity-module';

//
//
export class EntityResolver extends EntityModule {

  get accessor() { return this.entity.accessor }

  async resolveType( resolverCtx:ResolverContext ):Promise<any> {
    const impl = async (resolverCtx:ResolverContext) => {
      const id = _.get( resolverCtx.args, 'id' );
      const enit = await this.accessor.findById( id );
      return enit.item;
    };
    return this.decorateHooks( impl, resolverCtx, this.entity.hooks?.preTypeQuery, this.entity.hooks?.afterTypeQuery );
  }

  async resolveTypes( resolverCtx:ResolverContext ):Promise<any[]> {
    const impl = async (resolverCtx:ResolverContext) => {
      await this.entity.entityPermissions.addPermissionToFilter( resolverCtx );
      const filter = _.get( resolverCtx.args, 'filter');
      const sort = this.getSort( _.get( resolverCtx.args, 'sort') );
      const paging = _.get( resolverCtx.args, 'paging');
      const enits = await this.accessor.findByFilter( filter, sort, paging );
      return _.map( enits, enit => enit.item );
    };
    return this.decorateHooks( impl, resolverCtx, this.entity.hooks?.preTypesQuery, this.entity.hooks?.afterTypesQuery );
  }

  async saveType( resolverCtx:ResolverContext ):Promise<any> {
    const impl = async (resolverCtx:ResolverContext) => {
      const attributes = _.get( resolverCtx.args, this.entity.singular );
      const fileInfos = await this.setFileValuesAndGetFileInfos( resolverCtx.args, attributes );
      const result = await this.accessor.save( attributes );
      if( result instanceof EntityItem ) {
        this.saveFiles( result.item.id, fileInfos );
        return _.set( {validationViolations: []}, this.entity.singular, result.item );
      }
      return { validationViolations: result };
    };
    return this.decorateHooks( impl, resolverCtx, this.entity.hooks?.preSave, this.entity.hooks?.afterSave );
  }

  async deleteType( resolverCtx:ResolverContext ):Promise<string[]> {
    const impl = async (resolverCtx:ResolverContext) => {
      const id = resolverCtx.args.id;
      try { await this.accessor.delete( id ) } catch (error){ return [ 'Error', _.toString(error)] }
      try { await this.entity.fileSave.deleteFiles( id ) } catch (error) { return ['Error', _.toString(error)] }
      return [];
    };
    return this.decorateHooks( impl, resolverCtx, this.entity.hooks?.preSave, this.entity.hooks?.afterSave );
  }

  async resolveAssocToType( refEntity:Entity, resolverCtx:ResolverContext ):Promise<any> {
    const id = _.get( resolverCtx.root, refEntity.foreignKey );
    if( _.isNil(id) ) return null;
    if( refEntity.isPolymorph ) return this.resolvePolymorphAssocTo( refEntity, resolverCtx, id );
    const enit = await refEntity.findById( id );
    return enit.item;
  }

  async resolveAssocToManyTypes( refEntity:Entity, resolverCtx:ResolverContext ):Promise<any> {
    if( refEntity.isPolymorph ) return this.resolvePolymorphAssocToMany( refEntity, resolverCtx );
    const ids = _.map( _.get( resolverCtx.root, refEntity.foreignKeys ), id => _.toString(id) );
    const enits = await refEntity.findByIds( ids );
    return _.map( enits, enit => enit.item );
  }

  async resolveAssocFromTypes( refEntity:Entity, resolverCtx:ResolverContext ):Promise<any[]> {
    const id = _.toString(resolverCtx.root.id);
    const fieldName = refEntity.isAssocToMany( this.entity ) ? this.entity.foreignKeys : this.entity.foreignKey;
    const attr = _.set({}, fieldName, id );
    if( refEntity.isPolymorph ) return this.resolvePolymorphAssocFromTypes( refEntity, attr );
    const enits = await refEntity.findByAttribute( attr );
    return _.map( enits, enit => enit.item );
  }

  async resolveStats( resolverCtx:ResolverContext ):Promise<any> {
    await this.entity.entityPermissions.addPermissionToFilter( resolverCtx );
    const filter = _.get( resolverCtx.args, 'filter');
    const enits = await this.accessor.findByFilter( filter );
    const createdFirst = _.get( _.minBy( enits, enit => enit.item['createdAt'] ), 'item.createdAt' );
    const createdLast = _.get( _.maxBy( enits, enit => enit.item['createdAt'] ), 'item.createdAt' );
    const updatedLast = _.get( _.maxBy( enits, enit => enit.item['updatedAt'] ), 'item.updatedAt' );
    return { count: _.size( enits ), createdFirst, createdLast, updatedLast };
  }

  private async decorateHooks( impl:Function, resolverCtx:ResolverContext, preHook?:Function, afterHook?:Function ){
    let result = _.isFunction( preHook ) ? preHook( resolverCtx ): undefined;
    if( _.isObject(result) ) return result;
    result = impl( resolverCtx );
    return _.isFunction( afterHook ) ? afterHook( result, resolverCtx ): result;
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
    const enit = await polymorphType.findById( id );
    _.set( enit.item, '__typename', polymorphType.typeName );
    return enit.item;
  }

  private async resolvePolymorphAssocToMany( refEntity:Entity, resolverCtx:ResolverContext ):Promise<any> {
    throw 'not implemented';
  }

  private async resolvePolymorphAssocFromTypes(refEntity:Entity, attr:any ):Promise<any[]> {
    const result = [];
    for( const entity of refEntity.entities ){
      const enits = await entity.findByAttribute( attr );
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

}
