import * as FakerDE from 'faker/locale/de';
import * as FakerEN from 'faker/locale/en';
import _ from 'lodash';

import { AssocType, SeedAttributeType, SeedType } from '../core/domain-configuration';
import { Entity } from './entity';
import { EntityItem } from './entity-item';
import { EntityModule } from './entity-module';
import { ValidationViolation } from './entity-validation';

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
    const seeds = this.getSeedsDictionary();

    await Promise.all( _.map( seeds, (seed) => this.resolveAttributeValues( seed ) ) );
    await Promise.all( _.map( seeds, (seed, name) => this.seedInstanceAttributes( name, seed, ids ) ) );
    return _.set( {}, this.entity.typeName, ids );
  }

  /**
   *
   */
  public async seedReferences( idsMap:any ):Promise<void> {
    const seeds = this.getSeedsDictionary();
    await Promise.all( _.map( seeds, async (seed, name) => {

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

  public async deleteInvalidItems( idsMap:any, validationViolations:string[] ):Promise<void> {
    for( const entityName of _.keys(idsMap ) ){
      const entity = this.runtime.entity( entityName );
      const entityMap = idsMap[entityName];
      for( const seedName of _.keys( entityMap ) ){
        const id = entityMap[seedName];
        const ei = await entity.findById( id );
        const violations = await entity.validate( ei.item );
        if( _.isEmpty( violations ) ) continue;

        const result = _(violations).map( violation => `${violation.attribute} : ${violation.message} ` ).join(' , ');
        validationViolations.push( `${entityName}:${seedName} - ${result}` );
        await entity.accessor.delete( id );
      }
    }
  }

  private getSeedsDictionary(){
    if( _.isArray( this.entity.seeds ) ) return _.reduce( this.entity.seeds,
      (result, seed, index ) => _.set( result, _.toString(index), seed ), {} );

    _.forEach( this.entity.seeds, (seed, name) => {
      const count = _.toNumber( name );
      if( _.isNaN( count ) ) return;
      _.times( count, () =>
        _.set( this.entity.seeds, `generated-${ _.values( this.entity.seeds).length}`, _.cloneDeep( seed ) ) );
      _.unset( this.entity.seeds, name );
    });

    return this.entity.seeds;
  }

  /**
   *
   */
  private async resolveAttributeValues( seed:SeedType ){
    for( const attribute of _.keys(this.entity.attributes) ){
      const value = _.get( seed, attribute );
      const result = await this.resolveAttributeValue( value, seed );
      if( ! _.isUndefined( result ) ) _.set( seed, attribute, result );
    }
  }

  private async resolveAttributeValue( value:SeedAttributeType, seed:SeedType, idsMap?:any ) {
    return  _.isFunction( value ) ? Promise.resolve( value( { seed, runtime: this.runtime, idsMap } ) ) :
            _.has( value, 'eval' ) ? this.evalSeedValue( value, seed ) :
            value;
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
  private async seedAssocTo( assocTo: AssocType, seed:SeedType, idsMap: any, name: string ):Promise<void> {
    try {
      const refEntity = this.runtime.entities[assocTo.type];
      if ( ! refEntity || ! _.has( seed, refEntity.typeName ) ) return;

      const value:SeedAttributeType = _.get( seed, refEntity.typeName );
      const ref = await this.resolveAttributeValue( value, seed, idsMap );
      const id =
        _.isString( ref ) ?
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
      let refs = await this.resolveAttributeValue( value, seed, idsMap );
      if( ! _.isArray(refs) ) refs = [refs];

      const refIds = _.compact( _.map( refs, ref => _.get( idsMap, [refEntity.typeName, ref] ) ) );
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
  private async evalSeedValue( value:any, _seed:any, _idsMap?:any ):Promise<any>{
    if( this.skipShare( value ) ) return undefined;
    const locale = _.get( this.runtime.config.domainDefinition, 'locale', 'en' )

    // following is in context for eval
    const faker = _.get(fakers, locale, FakerEN );
    const ld = _;
    const seed = _seed;
    const idsMap = _idsMap;

    try {
      const result = ((expression:string) => eval( expression )).call( {}, value.eval );
      return result;
    } catch (error) {
      console.error( `could not evaluate '${value}'\n`, error);
    }
  }

  /**
   *
   */
  private skipShare( value:{share?:number}):boolean {
    if( ! _.isNumber( value.share ) ) return false;
    return _.random() > value.share;
  }

}
