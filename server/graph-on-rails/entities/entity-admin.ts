import inflection from 'inflection';
import _ from 'lodash'
import { EntityModule } from './entity-module';
import { TypeAttribute } from './type-attribute';

export type AdminField = {
  name:string
  label:string
  filter:string
  sort:boolean
}

/**
 *
 */
export class EntityAdmin extends EntityModule {

  get name() { return inflection.titleize( inflection.underscore( this.entity.name ) ) }
  get fields() { return this.getFields() }
  get label() { return this.getLabel() }
  get path() { return this.getPath() }
  get parent() { return this.getParent() }
  get rootQuery():boolean { return this.isRootQuery() }

  protected getFields():AdminField[] {
    return _.map( this.entity.attributes, (attribute, name) => this.buildAdminField( name, attribute ))
  }
  protected getParent():string | null { return null }
  protected getLabel() { return inflection.titleize(  this.entity.plural )  }
  protected getPath() { return this.entity.plural }
  protected isRootQuery():boolean { return true }


  protected buildAdminField( name:string, attribute:TypeAttribute ):AdminField {
    return {
      name,
      label: inflection.titleize( inflection.underscore( name ) ),
      filter:'na',
      sort: true
    };
  }
}
