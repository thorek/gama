// import ts from 'es6-template-strings';
import _ from 'lodash';
import { Collection, Db, FilterQuery, MongoClient, ObjectId } from 'mongodb';

import { FilterType } from '../builder/filter-type';
import { DataStore, Paging, Sort } from '../core/data-store';
import { ResolverContext } from '../core/resolver-context';
import { Entity } from '../entities/entity';
import { AssocFromFilterType } from './filter/assoc-from-filter-type';
import { BooleanFilterType } from './filter/boolean-filter-type';
import { DateFilterType } from './filter/date-filter-type';
import { EnumFilterType } from './filter/enum-filter-type';
import { FloatFilterType } from './filter/float-filter-type';
import { IdFilterType } from './filter/id-filter-type';
import { IntFilterType } from './filter/int-filter-type';
import { StringFilterType } from './filter/string-filter-type';

/**
 *
 */
export class MongoDbDataStore extends DataStore {


  /**
   *
   */
  constructor( protected db:Db ){ super() }

  /**
   *
   */
  public static async create( config:{url:string, dbName:string} ):Promise<DataStore> {
    const db = await this.getDb( config );
    return new MongoDbDataStore( db );
  }

  /**
   *
   */
  protected static async getDb( config:any ):Promise<Db> {
    const url = _.get( config, 'url' );
    if( ! url ) throw `please provide url`;
    const dbName = _.get( config, 'dbName' );
    if( ! dbName ) throw `please provide dbName`;
    const client = await MongoClient.connect( url, { useNewUrlParser: true, useUnifiedTopology: true } );
    return client.db(dbName);
  }

  /**
   *
   */
  async findById( entity:Entity, id:ObjectId|string ):Promise<any> {
    if( ! (id instanceof ObjectId) ) id = this.getObjectId( id, entity );
    const collection = this.getCollection( entity );
    const item = await collection.findOne( id );
    return this.buildOutItem( item );
  }

  /**
   *
   */
  async findByIds( entity:Entity, ids:(ObjectId|string)[] ):Promise<any> {
    ids = _.map( ids, id => this.getObjectId( id, entity ) );
    const collection = this.getCollection( entity );
    const items = await collection.find( {_id: { $in: ids }} ).toArray();
    return _.map( items, item => this.buildOutItem( item ) );
  }

  /**
   *
   */
  async findByAttribute( entity:Entity, attrValue:{[name:string]:any}, sort?:Sort ):Promise<any[]> {
    return this.findByExpression( entity, attrValue, sort );
  }

  /**
   *
   */
  async findByFilter( entity:Entity, filter:any, sort?:Sort, paging?:Paging ):Promise<any[]> {
    const expression = await this.buildExpression( entity, filter );
    return this.findByExpression( entity, expression, sort, paging );
  }

  async aggregateFind( entities:Entity[], filter:any, sort?:Sort, paging?:Paging ):Promise<any[]>{
    if( entities.length === 0 ) return [];

    const expression = await this.buildExpression( _.first(entities) as Entity, filter );
    const lookups:any[] = _.map( entities, entity => ({
      $lookup: {
        from: entity.typesQuery,
        pipeline: [
          { $addFields: { __typename: entity.typeName } },
        ],
        as: entity.typesQuery
      }
    }));
    const concatArrays = _.map( entities, entity => `$${entity.typesQuery}` );
    const aggregateDefinition = _.compact( _.concat(
      { $limit: 1 },
      { $project: { _id: '$$REMOVE' } },
      lookups,
      { $project: { union: { $concatArrays: concatArrays } } },
      { $unwind: '$union' },
      { $replaceRoot: { newRoot: '$union' } },
      { $sort: this.getSort( sort ) }
    ));

    const randomEntity = _.first( entities ) as Entity;
    const sortStage = this.getSort( sort );
    const sl = this.getSkipLimit( paging );
    if( sl.limit === 0 ) sl.limit = Number.MAX_SAFE_INTEGER;
    const aggregate = this.getCollection( randomEntity ).aggregate( aggregateDefinition ).match(expression);
    const items = await aggregate.sort( sortStage ).skip(sl.skip).limit(sl.limit).toArray();
    return _.map( items, item => this.buildOutItem( item ) );
  }

  /**
   *
   */
  async create( entity:Entity, attrs:any ):Promise<any> {
    const collection = this.getCollection( entity );
    const result = await collection.insertOne( attrs );
    return this.findById( entity, result.insertedId );
  }

  /**
   *
   */
  async update( entity:Entity, attrs: any ):Promise<any> {
    const _id = new ObjectId( attrs.id );
    delete attrs.id;
    const collection = this.getCollection( entity );
    const result = await collection.updateOne( { _id }, { $set: attrs }, { upsert: false } );
    return this.findById( entity, _id );
  }


  /**
   *
   */
  async delete( entityType:Entity, id:any  ):Promise<boolean> {
    const collection = this.getCollection( entityType );
    collection.deleteOne( { _id: new ObjectId( id ) } );
    return true;
  }

  /**
   *
   */
  async truncate( entity:Entity ):Promise<boolean> {
    const collectionName = entity.collection;
    if( await this.collectionExist( collectionName ) ) try {
      await this.db.dropCollection( collectionName );
      return true;
    } catch (error) {
      console.error( error );
    }
    return false;
  }


  /**
   *
   */
  getEnumFilterType( enumName: string ) {
    return new EnumFilterType( enumName );
  }

  /**
   *
   */
  getScalarFilterTypes():FilterType[] {
    return [
      new StringFilterType(),
      new IntFilterType(),
      new FloatFilterType(),
      new BooleanFilterType(),
      new DateFilterType(),
      new IdFilterType(),
      new AssocFromFilterType( this.db )
    ]
  }

  /**
   *
   */
  protected getObjectId( id:any, entity:Entity ):ObjectId {
    if( ! id ) throw new Error(`cannot resolve type '${entity.name}' without id`);
    try {
      return new ObjectId( _.toString( id ) );
    } catch (error) {
      throw new Error( `could not convert '${id}' for '${entity.name}' to an ObjectId` );
    }
  }

  /**
   *
   */
  protected async findByExpression( entity:Entity, expression:any, sort?:Sort, paging?:Paging ):Promise<any[]> {
    const collection = this.getCollection( entity );
    const sortStage = this.getSort( sort );
    const sl = this.getSkipLimit( paging );
    const items = await collection.find( expression ).sort( sortStage ).skip( sl.skip ).limit( sl.limit ).toArray();
    return _.map( items, item => this.buildOutItem( item ) );
  }

  /**
   *
   */
  protected async buildExpression( entity:Entity, filter:any ):Promise<FilterQuery<any>> {
    const filterQuery:FilterQuery<any> = {};
    for( const field of _.keys(filter) ){
      const condition = filter[field];
      await FilterType.setFilterExpression( filterQuery, entity, condition, field );
    }
    return filterQuery;
  }

  /**
   *
   */
  protected getCollection( entity:Entity ):Collection {
    return this.db.collection( entity.collection  );
  }

  /**
   *
   */
	protected buildOutItem( entity:any ):any {
    if( ! _.has( entity, '_id' ) ) return null;
    _.set( entity, 'id', entity._id );
    _.unset( entity, '_id' );
    return entity;
	}


  /**
   *
   */
  protected async collectionExist( name:string ):Promise<boolean> {
    const collection = await this.db.listCollections({name}).next();
    return collection != null;
  }

  // TODO permissions

  /**
   *
   */
  async addPermittedIds( filter:any, ids:any[]|boolean ):Promise<any> {
    if( ids === true ) return filter;
    if( ids === false ) ids = [];
    return { $and: [ { _id: { $in: ids } }, filter ] };
  }

  /**
   *
   */
  async getPermittedIds( entity:Entity, permission:object, resolverCtx:ResolverContext ):Promise<number[]> {
    let expression:string|object = _.get( permission, 'filter' );
    if( _.isString( expression ) ) {
      // expression = ts( expression, resolverCtx.context );
      expression = JSON.parse( expression as string );
    } else {
      expression = this.buildPermittedIdsFilter( entity, permission, resolverCtx.context );
    }
    const result = await this.findByExpression( entity, expression );
    return _.map( result, item => _.get(item, '_id' ) );
  }

  /**
   *
   */
  async getPermittedIdsForForeignKeys( entity:Entity, assocTo:string, foreignKeys:any[] ):Promise<number[]> {
    foreignKeys = _.map( foreignKeys, key => key.toString() );
    const expression = _.set({}, assocTo, { $in: foreignKeys } );
    const result = await this.findByExpression( entity, expression );
    return _.map( result, item => _.get(item, '_id' ) );
  }

  /**
   *  all:
   *    - read
   *    - status:
   *        - draft
   *        - open
   *      name: user.assignedContracts  # will be resolved with context
   */
  private buildPermittedIdsFilter( entity:Entity, permission:object, context:any ):object {
    const conditions:any[] = [];
    _.forEach( permission, (values:any|any[], attribute:string) => {
      if( _.isArray( values ) ) {
        values = _.map( values, value => _.get( context, value, value ) );
        conditions.push( _.set( {}, attribute, { $in: values } ) );
      } else {
        values = this.resolvePermissionValue( entity, attribute, values, context );
        if( attribute === '_id' ) values = new ObjectId(values);
        conditions.push( _.set( {}, attribute, { $eq: values } ) );
      }
    });
    return _.size( conditions ) > 1 ? { $and: conditions } : _.first( conditions );
  }

  /**
   *
   */
  private resolvePermissionValue( entity:Entity, attribute:string, value:any, context:any ):any {
    value = _.get( context, value, value );
    return attribute === '_id' || entity.isAssocToAttribute( attribute ) ? new ObjectId( value ) : value;
  }

  private getSort( sort?:Sort ):any {
    return _.isUndefined( sort ) ? { _id: -1 } : _.set( {}, sort.field, sort.direction === 'ASC' ? 1 : -1 ) ;
  }

  private getSkipLimit( paging?:Paging ):{ skip:number, limit:number }{
    if( ! paging) return { skip: 0, limit: 0 };
    return { skip: paging.page * paging.size, limit: paging.size };
  }
}
