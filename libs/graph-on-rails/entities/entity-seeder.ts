import * as FakerDE from 'faker/locale/de';
import * as FakerEN from 'faker/locale/en';
import _ from 'lodash';

import { AssocType } from '../core/domain-configuration';
import { Entity } from './entity';
import { EntityItem } from './entity-item';
import { EntityModule } from './entity-module';

const fakers = {de: FakerDE, en: FakerEN};

/**
 *
 */
export class EntitySeeder extends EntityModule {


  /**
   *
   */
  public async truncate():Promise<boolean> {
    return await this.entity.resolver.truncate();
  }

  /**
   *
   */
  public async seedAttributes():Promise<any> {
    const ids = {};
    if( _.has( this.entity.seeds, 'Faker') ) {
      await this.generateFaker( _.get(this.entity.seeds, 'Faker') );
      _.unset( this.entity.seeds, 'Faker' );
    }
    await Promise.all( _.map( this.entity.seeds, (seed) => this.resolveFnProperties(seed ) ) );
    await Promise.all( _.map( this.entity.seeds, (seed, name) => this.seedInstanceAttributes( name, seed, ids ) ) );
    return _.set( {}, this.entity.typeName, ids );
  }

  /**
   *
   */
  public async seedReferences( idsMap:any ):Promise<void> {
    await Promise.all( _.map( this.entity.seeds, async (seed, name) => {

      const assocTos = _.concat(
        this.entity.assocTo,
        _.flatten(_.map( this.entity.implements, impl => impl.assocTo )));
      await Promise.all( _.map( assocTos, async assocTo => {
        await this.seedAssocTo( assocTo, seed, idsMap, name );
      }));

      const assocToManys = _.concat(
        this.entity.assocToMany,
        _.flatten(_.map( this.entity.implements, impl => impl.assocToMany )));

      await Promise.all( _.map( assocToManys, async assocToMany => {
        await this.seedAssocToMany( assocToMany, seed, idsMap, name );
      }));
    }));
  }

  /**
   *
   */
  private async generateFaker( fakerSeed:any ):Promise<void> {
    const count = fakerSeed.count || 30;
    delete fakerSeed.count;
    for( let i = 0; i < count; i++ ){
      const seed = await this.generateFakeSeed( fakerSeed );
      if( seed ) _.set( this.entity.seeds, `Fake-${i}`, seed );
    }
  }

  /**
   *
   */
  private async generateFakeSeed( fakerSeed:any ):Promise<any> {
    const seed = {};
    for( const name of _.keys(fakerSeed) ){
      let value = fakerSeed[name];
      if( ! this.entity.isAssoc( name ) ) {
        if( value.every ) {
          if( _.random( value.every ) !== 1 ) continue;
          value = value.value;
        }
        value = await this.evalFake( value, seed )
      };
      _.set( seed, name, value );
    }
    return seed;
  }

  /**
   *
   */
  private async resolveFnProperties( seed:any ){
    for( const attribute of _.keys(this.entity.attributes) ){
      const property = _.get( seed, attribute );
      if( _.isFunction( property ) ){
        const value = await Promise.resolve( property() );
        _.set( seed, attribute, value );
      }
    }
  }

  /**
   *
   */
  private async seedInstanceAttributes( name:string, seed:any, ids:any ):Promise<any> {
    try {
      let enit = await EntityItem.create( this.entity, seed );
      enit = await enit.save( true );
      if( ! enit ) throw `seed '${name}' could not be saved`;
      const id = enit.item.id;
      if( ! id ) throw `seed '${name}' has no id`;
      _.set( ids, name, id );
    } catch (error) {
      console.error( `Entity '${this.entity.typeName }' could not seed an instance`, seed, error );
    }
  }

  /**
   *
   */
  private async seedAssocTo( assocTo: AssocType, seed: any, idsMap: any, name: string ):Promise<void> {
    try {
      const refEntity = this.runtime.entities[assocTo.type];
      if ( ! refEntity || ! _.has( seed, refEntity.typeName ) ) return;

      const value = _.get( seed, refEntity.typeName );
      const id = _.startsWith( name, 'Fake' ) ? await this.evalFake( value, seed, idsMap ) :
        _.isString( value ) ?
          _.get( idsMap, [refEntity.typeName, value] ) :
          _.get( idsMap, [value.type, value.id] );

      const refType = _.get( value, 'type' );
      if ( id ) await this.updateAssocTo( idsMap, name, refEntity, id, refType );
    }
    catch ( error ) {
      console.error( `Entity '${this.entity.typeName}' could not seed a reference`, assocTo, name, error );
    }
  }

  /**
   *
   */
  private async seedAssocToMany( assocToMany: AssocType, seed: any, idsMap: any, name: string ):Promise<void> {
    try {
      const refEntity = this.runtime.entities[assocToMany.type];
      if ( ! refEntity || ! _.has( seed, refEntity.typeName ) ) return;

      let value:string|string[] = _.get( seed, refEntity.typeName );
      let refIds = undefined;
      if( _.startsWith( name, 'Fake' ) ) {
        refIds = await this.evalFake( value, seed, idsMap );
      } else {
        if( ! _.isArray(value) ) value = [value];
        refIds = _.compact( _.map( value, refName => _.get( idsMap, [refEntity.typeName, refName] ) ) );
      }
      await this.updateAssocToMany( idsMap, name, refEntity, refIds );
    }
    catch ( error ) {
      console.error( `Entity '${this.entity.typeName}' could not seed a reference`, assocToMany, name, error );
    }
  }

  /**
   *
   */
  private async updateAssocTo( idsMap: any, name: string, refEntity: Entity, refId: string, refType?: string ) {
    const id = _.get( idsMap, [this.entity.typeName, name] );
    if( ! id ) return console.warn(
      `[${this.entity.name}] cannot update assocTo, no id for '${refEntity.name}'.${name}`);
    const enit = await this.entity.findById( id );
    _.set( enit.item, refEntity.foreignKey, _.toString(refId) );
    if( refType ) _.set( enit.item, refEntity.typeField, refType );
    await enit.save( true );
  }

  /**
   *
   */
  private async updateAssocToMany( idsMap:any, name:string, refEntity:Entity, refIds:any[] ) {
    refIds = _.map( refIds, refId => _.toString( refId ) );
    const id = _.get( idsMap, [this.entity.typeName, name] );
    const enit = await this.entity.findById( id );
    _.set( enit.item, refEntity.foreignKeys, refIds );
    await enit.save( true );
  }

  /**
   *
   */
  private async evalFake( value:any, seed:any, idsMap?:any ):Promise<any>{
    const locale = _.get( this.runtime.config.domainDefinition, 'locale', 'en' )
    const faker = _.get(fakers, locale, FakerEN );
    const ld = _;
    try {
      return _.isFunction( value ) ?
        Promise.resolve( value( { idsMap, seed, runtime: this.runtime } ) ) :
        ((expression:string) => eval( expression )).call( {}, value );
    } catch (error) {
      console.error( `could not evaluate '${value}'\n`, error);
    }
  }

}
