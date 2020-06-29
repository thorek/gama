import { FilterType } from '../builder/filter-type';
import { Entity } from '../entities/entity';
import { ResolverContext } from './resolver-context';

export type Sort = {
  field:string
  direction:'ASC'|'DESC'
}

/**
 *
 */
export abstract class DataStore {

  abstract findById( entity:Entity, id:any ):Promise<any>

  abstract findByIds( entity:Entity, id:any ):Promise<any>

  abstract findByAttribute( entity:Entity, attrValue:{[name:string]:any} ):Promise<any[]>;

  abstract aggregateFind( dummyEntity:Entity, entities:Entity[], filter:any, sort?:Sort ):Promise<any[]>;

  /**
   *
   * @param entity the entity
   * @param filter the filter as it would be build from the filter types of this datasource
   * @returns all items matching the filter
   */
  abstract findByFilter( entity:Entity, filter:any, sort?:Sort ):Promise<any[]>;

  abstract create( entity:Entity, attrs: any ):Promise<any>;

  abstract update( entity:Entity, attrs: any ):Promise<any>;

  abstract delete( entity:Entity, id:any  ):Promise<boolean>;

  abstract truncate( entity:Entity ):Promise<boolean>;

  abstract getScalarFilterTypes():FilterType[];

  abstract getEnumFilterType( name: string ):FilterType;


  /**
   * @deprecated
   */
  abstract addPermittedIds( expression:any, ids:any[]|boolean ):Promise<any>;

  /**
   * @deprecated
   */
  abstract getPermittedIds( entity:Entity, expression:object, resolverCtx:ResolverContext ):Promise<number[]>;

  /**
   * @deprecated
   */
  abstract getPermittedIdsForForeignKeys( entity:Entity, assocTo:string, foreignKeys:number[] ):Promise<number[]>;

}
