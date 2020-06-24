import inflection from 'inflection';
import _ from 'lodash'
import { EntityModule } from './entity-module';
import { TypeAttribute } from './type-attribute';

export type AdminField = {
  name:string
  label:string
  filter:string
  sortable:boolean
  orderNr?:number
}

/**
 *
 */
export class EntityAdmin extends EntityModule {

  get name() { return inflection.titleize( inflection.underscore( this.entity.plural ) ) }
  get fields() { return this.getFields() }
  get label() { return this.getLabel() }
  get path() { return this.getPath() }
  get parent() { return this.getParent() }

  get orderNr():number|undefined { return this.getOrderNr() }
  get typeQuery() { return this.entity.typeQuery }
  get typesQuery() { return this.entity.typesQuery }


  protected getFields():AdminField[] {
    return _.map( this.entity.attributes, (attribute, name) => this.buildAdminField( name, attribute ))
  }
  protected getParent():string | null { return null }
  protected getLabel() { return inflection.titleize(  this.entity.plural )  }
  protected getPath() { return inflection.underscore( this.entity.plural ) }
  protected getOrderNr():number|undefined { return undefined }

  /**
   *
   */
  protected buildAdminField( name:string, attribute?:TypeAttribute ):AdminField {
    return {
      name,
      label: inflection.titleize( inflection.underscore( name ) ),
      filter:'na',
      sortable: true
    };
  }
}
