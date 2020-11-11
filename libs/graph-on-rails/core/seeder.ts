import _ from 'lodash';
import * as faker from 'faker';

import { Entity } from '../entities/entity';
import { Runtime } from './runtime';

export class Seeder {

  /**
   *
   */
  private constructor( private entities:Entity[] ){}

  /**
   *
   */
  static create( runtime:Runtime ):Seeder {
    const locale = _.get( runtime.config.domainDefinition, 'locale', 'en' );
    _.set(faker, 'locale', locale );
    return new Seeder( _.values(runtime.entities) );
  }

  /**
   *
   * @param truncate whether to truncate all collections before seed (clean seed)
   */
  async seed( truncate:boolean ):Promise<string[]> {
    const result:string[] = [];
    const entities = _.filter( this.entities, entity => ( entity instanceof Entity ) ) as Entity[];
    if( truncate ) await this.truncate( entities, result );
    const idsMap = {};
    await Promise.all( _.map( entities, async entity => _.merge( idsMap, await entity.seeder.seedAttributes() ) ) );
    await Promise.all( _.map( entities, async entity => _.merge( idsMap, await entity.seeder.seedReferences( idsMap ) ) ) );

    _.forEach( idsMap, (entityIdsMap,entityName) => {
      const count = _.size( _.values( entityIdsMap ) );
      if( count ) result.push( `Seeded ${count} ${entityName} ${ count > 1 ? 'items' : 'item'}` );
    })
    return result;
  }

  private async truncate( entities:Entity[], result:string[] ){
    for( const entity of entities ){
      const truncated = await entity.seeder.truncate() ;
      if( truncated ) result.push( `Truncated ${entity.name}` );
    }
  }
}
