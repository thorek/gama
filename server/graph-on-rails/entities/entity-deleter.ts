import _ from 'lodash';
import { EntityModule } from './entity-module';
import { AssocFromType } from './entity';

//
//
export class DeletionError extends Error {

  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    this.name = DeletionError.name; // stack traces display correctly now
  }
}

//
//
export class EntityDeleter extends EntityModule {

  async deleteAssocFrom( id:string ) {
    // first check if any prevents - then delete
    for( const assocFrom of this.entity.assocFrom ){
      if( assocFrom.delete === 'prevent') this.preventAssocFrom( id, assocFrom );
    }
    for( const assocFrom of this.entity.assocFrom ){
      if( assocFrom.delete === 'cascade') this.cascadeAssocFrom( id, assocFrom );
    }
  }

  private async cascadeAssocFrom( id:string, assocFrom:AssocFromType ) {
    const refEntity = this.context.entities[assocFrom.type];
    const items = await refEntity.accessor.findByAttribute( _.set( {}, this.entity.foreignKey, id ) );
    for( const item of items ) await refEntity.accessor.delete( item.id );
  }

  private async preventAssocFrom( id:string, assocFrom:AssocFromType ) {
    const refEntity = this.context.entities[assocFrom.type];
    const items = await refEntity.accessor.findByAttribute( _.set( {}, this.entity.foreignKey, id ) );
    const size = _.size( items);
    if( size > 0 ) throw new DeletionError(
      `[${this.entity.name}#${id}] cannot be deleted - ${size} ${assocFrom.type} prevent it.`);
  }

}
