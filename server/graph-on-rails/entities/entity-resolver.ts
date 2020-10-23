import { Sort } from 'graph-on-rails/core/data-store';
import _ from 'lodash';

import { ResolverContext } from '../core/resolver-context';
import { Entity } from './entity';
import { FileInfo } from './entity-file-save';
import { EntityItem } from './entity-item';
import { EntityModule } from './entity-module';

//
//
export class EntityResolver extends EntityModule {

  get accessor() { return this.entity.accessor }

  /**
   *
   */
  async resolveType( resolverCtx:ResolverContext ):Promise<any> {
    const id = _.get( resolverCtx.args, 'id' );
    const enit = await this.accessor.findById( id );
    return enit.item;
  }

  /**
   *
   */
  async resolveTypes( resolverCtx:ResolverContext ):Promise<any[]> {
    await this.entity.entityPermissions.addPermissionToFilter( resolverCtx );
    const filter = _.get( resolverCtx.args, 'filter');
    const sort = this.getSort( _.get( resolverCtx.args, 'sort') );
    const enits = await this.accessor.findByFilter( filter, sort );
    return _.map( enits, enit => enit.item );
  }

  /**
   *
   */
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
   *
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

  /**
   *
   */
  async saveType( resolverCtx:ResolverContext ):Promise<any> {
    const attributes = _.get( resolverCtx.args, this.entity.singular );
    const fileInfos = await this.setFileValuesAndGetFileInfos( resolverCtx.args, attributes );
    this.setTimestamps( attributes );
    const result = await this.accessor.save( attributes );
    if( result instanceof EntityItem ) {
      this.saveFiles( result.item.id, fileInfos );
      return _.set( {validationViolations: []}, this.entity.singular, result.item );
    }
    return { validationViolations: result };
  }

  /**
   *
   */
  async deleteType( resolverCtx:ResolverContext ):Promise<string[]> {
    const id = resolverCtx.args.id;
    try {
      await this.accessor.delete( id );
      return [];
    } catch (error) {
      return [
        'Error',
        _.toString(error)
      ];
    }
  }

  /**
   *
   */
  async resolveAssocToType( refEntity:Entity, resolverCtx:ResolverContext ):Promise<any> {
    const id = _.get( resolverCtx.root, refEntity.foreignKey );
    if( _.isNil(id) ) return null;
    if( refEntity.isPolymorph ) return this.resolvePolymorphAssocTo( refEntity, resolverCtx, id );
    const enit = await refEntity.findById( id );
    return enit.item;
  }

  /**
   *
   */
  private async resolvePolymorphAssocTo( refEntity:Entity, resolverCtx:ResolverContext, id:any ):Promise<any> {
    const polymorphType = this.context.entities[_.get( resolverCtx.root, refEntity.typeField )];
    const enit = await polymorphType.findById( id );
    _.set( enit.item, '__typename', polymorphType.typeName );
    return enit.item;
  }

  /**
   *
   */
  async resolveAssocToManyTypes( refEntity:Entity, resolverCtx:ResolverContext ):Promise<any> {
    if( refEntity.isPolymorph ) return this.resolvePolymorphAssocToMany( refEntity, resolverCtx );
    const ids = _.map( _.get( resolverCtx.root, refEntity.foreignKeys ), id => _.toString(id) );
    const enits = await refEntity.findByIds( ids );
    return _.map( enits, enit => enit.item );
  }

  /**
   *
   */
  private async resolvePolymorphAssocToMany( refEntity:Entity, resolverCtx:ResolverContext ):Promise<any> {
    throw 'not implemented';
  }

  /**
   *
   */
  async resolveAssocFromTypes( refEntity:Entity, resolverCtx:ResolverContext ):Promise<any[]> {
    const id = _.toString(resolverCtx.root.id);
    const fieldName = refEntity.isAssocToMany( this.entity ) ? this.entity.foreignKeys : this.entity.foreignKey;
    const attr = _.set({}, fieldName, id );
    if( refEntity.isPolymorph ) return this.resolvePolymorphAssocFromTypes( refEntity, attr );
    const enits = await refEntity.findByAttribute( attr );
    return _.map( enits, enit => enit.item );

  }

  /**
   *
   */
  private async resolvePolymorphAssocFromTypes(refEntity:Entity, attr:any ):Promise<any[]> {
    const result = [];
    for( const entity of refEntity.entities ){
      const enits = await entity.findByAttribute( attr );
      _.forEach( enits, enit => _.set(enit.item, '__typename', entity.typeName ) );
      result.push( enits );
    }
    return _(result).flatten().compact().map( enit => enit.item ).value();
  }

  /**
   *
   */
  async truncate():Promise<boolean>{
    return this.accessor.truncate();
  }

  /**
   *
   */
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
      _.set( attributes, name, _.pick(value, 'filename', 'encoding', 'mimetype') );
      resolve({ name, filename: _.get(value, 'filename'), stream: value.createReadStream() });
    }));
  }

  /**
   *
   */
  private async saveFiles( id:string, fileInfos:FileInfo[] ):Promise<void> {
    for( const fileInfo of fileInfos ) await this.entity.fileSave.saveFile( id, fileInfo );
  }

  /**
   *
   */
  private setTimestamps( attributes:any ):void {
    const now = _.toString( Date.now() );
    if( ! attributes.id ) _.set( attributes, 'createdAt', now );
    _.set( attributes, 'updatedAt', now );
  }
}
