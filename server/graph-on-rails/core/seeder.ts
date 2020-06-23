import _ from 'lodash';

import { Entity } from '../entities/entity';
import { Context } from './context';

export class Seeder {

	//
	//
	private constructor( private entities:Entity[] ){}

  /**
   *
   */
  static create( context:Context ):Seeder {
    return new Seeder( _.values(context.entities) );
  }

	//
	//
  async seed( truncate:boolean ):Promise<number> {
    const entities = _.filter( this.entities, entity => ( entity instanceof Entity ) ) as Entity[];
    if( truncate ) await Promise.all( _.map( entities, async entity => await entity.seeder.truncate() ) );
    const idsMap = {};
    await Promise.all( _.map( entities, async entity => _.merge( idsMap, await entity.seeder.seedAttributes() ) ) );
    await Promise.all( _.map( entities, async entity => _.merge( idsMap, await entity.seeder.seedReferences( idsMap ) ) ) );
    return _.sum( _.map( idsMap, entityIdsMap => _.size( _.values( entityIdsMap ) ) ) );
	}
}
