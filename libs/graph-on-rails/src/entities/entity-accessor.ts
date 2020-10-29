import _ from 'lodash';

import { Paging, Sort } from '../core/data-store';
import { AssocType } from './entity';
import { EntityDeleter } from './entity-deleter';
import { EntityItem } from './entity-item';
import { EntityModule } from './entity-module';
import { ValidationViolation } from './entity-validator';

//
//
export class NotFoundError extends Error {

  constructor(message?:string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    this.name = NotFoundError.name; // stack traces display correctly now
  }
}

//
//
export class EntityAccessor extends EntityModule {

  protected deleter = new EntityDeleter(this.entity);
  get dataStore() { return this.entity.runtime.dataStore }

  /**
   *
   */
  async findById( id:any ):Promise<EntityItem> {
    if( ! id ) throw new Error( `[${this.entity.name}].findById - no id provided` );
    const item = await this.dataStore.findById( this.entity, id );
    if( ! item ) throw new NotFoundError( `[${this.entity.name}] with id '${id}' does not exist`);
    return EntityItem.create( this.entity, item );
  }

  /**
   *
   */
  async findByIds( ids:any[] ):Promise<EntityItem[]> {
    const items = await this.dataStore.findByIds( this.entity, ids );
    return Promise.all( _.map( items, item => EntityItem.create( this.entity, item ) ) );
  }

  /**
   *
   */
  async findByAttribute( attrValue:{[name:string]:any} ):Promise<EntityItem[]>{
    const items = await this.dataStore.findByAttribute( this.entity, attrValue );
    return Promise.all( _.map( items, item => EntityItem.create( this.entity, item ) ) );
  }

  /**
   *
   * @param filter as it comes from the graphql request
   */
  async findByFilter( filter:any, sort?:Sort, paging?:Paging ):Promise<EntityItem[]> {
    const items = this.entity.isPolymorph ?
      await this.dataStore.aggregateFind( this.entity.getThisOrAllNestedEntities(), filter, sort, paging ) :
      await this.dataStore.findByFilter( this.entity, filter, sort, paging );
    return Promise.all( _.map( items, item => EntityItem.create( this.entity, item ) ) );
  }

  /**
   *
   */
  async save( attributes:any, skipValidation = false ):Promise<EntityItem|ValidationViolation[]> {
    this.setDefaultValues( attributes );
    if( ! skipValidation ){
      const validationViolations = await this.entity.validate( attributes );
      if( _.size( validationViolations ) ) return validationViolations;
    }
    const item = _.has( attributes, 'id') ?
      await this.dataStore.update( this.entity, attributes ) :
      await this.create( attributes );
    return EntityItem.create( this.entity, item );
  }

  /**
   *
   */
  private async create( attributes:any ){
    for( const assocTo of this.entity.assocToInput ) await this.createInlineInput( assocTo, attributes );
    return this.dataStore.create( this.entity, attributes );
  }

  /**
   *
   */
  async delete( id:any ):Promise<boolean> {
    await this.deleter.deleteAssocFrom( id );
    return this.dataStore.delete( this.entity, id );
  }

  /**
   *
   */
  truncate():Promise<boolean>{
    return this.dataStore.truncate( this.entity );
  }

  /**
   *
   */
  private async createInlineInput( assocTo: AssocType, attrs: any ) {
    const refEntity = this.runtime.entities[assocTo.type];
    const input = _.get( attrs, refEntity.singular );
    if( ! input ) return;
    if ( _.has( attrs, refEntity.foreignKey ) ) throw new Error(
      `'${this.entity.name} you cannot have '${refEntity.foreignKey}' if you provide inline input'` );
    const item = await this.dataStore.create( refEntity, input );
    _.set( attrs, refEntity.foreignKey, _.toString( item.id ) );
    _.unset( attrs, refEntity.singular );
  }

  /**
   *
   */
  private setDefaultValues( attributes:any ):void {
    _.forEach( this.entity.attributes, (attribute, name) => {
      if( _.has( attributes, name ) || _.isUndefined( attribute.defaultValue ) ) return;
      _.set( attributes, name, attribute.defaultValue );
    });
  }

}
