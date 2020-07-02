import _ from 'lodash';
import * as faker from 'faker';
import { Entity, AssocType } from './entity';
import { EntityModule } from './entity-module';
import { EntityItem } from './entity-item';

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
    if( _.has( this.entity.seeds, 'Faker') ) this.generateFaker( _.get(this.entity.seeds, 'Faker') );
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
  private generateFaker( fakerSeed:any ):void {
    const count = fakerSeed.count || 30;
    delete fakerSeed.count;
    const fakeSeeds = _.compact( _.times( count, () => this.generateFakeSeed( fakerSeed )) );
    console.log({fakeSeeds})
    // this.entity.seeds.push( ... fakeSeeds );
  }

  /**
   *
   */
  private generateFakeSeed( fakerSeed:any ):any {
    const seed = {};
    _.forEach( fakerSeed, (value, name) => {
      if( this.entity.isAssoc( name ) ) return;
      try {
        value = (() => { return eval(value) }).call( {faker, _ } );
        _.set( seed, name, value );
      }
      catch (error) { return console.error( error ) }
    });
    return seed;
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
      const refEntity = this.context.entities[assocTo.type];
      if ( refEntity && _.has( seed, refEntity.typeName ) ) {
        const refName = _.get( seed, refEntity.typeName );
        let refId = undefined;
        let refType = undefined;
        if( _.isString( refName ) ){
          refId = _.get( idsMap, [refEntity.typeName, refName] );
        } else {
          refId = _.get( idsMap, [refName.type, refName.id] );
          refType = refName.type;
        }
        if ( refId ) await this.updateAssocTo( idsMap, name, refEntity, refId, refType );
      }
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
      const refEntity = this.context.entities[assocToMany.type];
      if ( refEntity && _.has( seed, refEntity.typeName ) ) {
        let refNames:string|string[] = _.get( seed, refEntity.typeName );
        if( ! _.isArray(refNames) ) refNames = [refNames];
        const refIds = _.compact( _.map( refNames, refName => _.get( idsMap, [refEntity.typeName, refName] ) ) );
        await this.updateAssocToMany( idsMap, name, refEntity, refIds );
      }
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


}
