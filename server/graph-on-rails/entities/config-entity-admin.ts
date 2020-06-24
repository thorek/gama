import _ from 'lodash';

import { AttributeConfig, ConfigEntity } from './config-entity';
import { AdminField, EntityAdmin } from './entity-admin';

export type AdminConfig = {
  label?:string
  path?:string
  parent?:string
  orderNr?:number
}

export class ConfigEntityAdmin extends EntityAdmin {

  get adminConfig() { return _.get(this.entity.entityConfig, 'admin' ) || {} }

  constructor( protected entity:ConfigEntity ){ super( entity ) }

  protected getLabel() { return this.adminConfig.label || super.getLabel() }
  protected getPath() { return this.adminConfig.path || super.getPath() }
  protected getParent() { return this.adminConfig.parent || super.getParent() }
  protected getOrderNr():number|undefined { return this.adminConfig.orderNr || super.getOrderNr() }

  /**
   *
   */
  protected getFields():AdminField[] {
    return _.map( this.entity.entityConfig.attributes, (attribute, name) =>
      this.buildAdminConfigField( name, attribute ));
  }

  /**
   *
   */
  protected buildAdminConfigField( name:string, attribute:AttributeConfig|string ):AdminField {
    const deflt = super.buildAdminField( name, this.entity.attributes[name] );
    if( ! deflt ) throw new Error( `could not get default adminField metadata for '${name}'` );
    if( _.isString( attribute ) ) return deflt;
    const field = {
      name,
      label: attribute.label,
      sortable: attribute.sortable,
      filter: attribute.filterType,
    }

    return _.defaults( field, deflt );
  }
}


