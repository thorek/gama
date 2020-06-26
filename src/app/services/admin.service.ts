import * as _ from 'lodash';
import * as inflection from 'inflection';
import { Injectable } from '@angular/core';
import { MetaDataService } from './meta-data.service';

export type ActionType = 'index'|'show';

export type FieldConfigType = {
  name:string,
  type?:string,
  virtual?:boolean,
  unique?:boolean,
  required?:boolean,
  label?:string,
  value?:(entity:any, action?:ActionType) => any,
}

export type FieldsConfigType = {[field:string]:FieldConfigType}

export type ColumnConfigType = {
  name:string
  label?:string|(() => string)
  value?:(item:any) => string
}

export type IndexConfigType = {
  assoc?:{[assoc:string]:string[]}
  columns?:(string|ColumnConfigType)[]
}

export type EntityConfigType = {
  fields?:FieldsConfigType,
  entitesName?:string,
  entityName?:string,
  typesQuery?:string,
  typeQuery?:string,
  name?:(entity:any, action?:ActionType ) => string,
  index?:IndexConfigType
}
export type AdminConfigType = {entities?:{ [entity:string]:EntityConfigType}}

@Injectable({providedIn: 'root'})
export class AdminService {

  private adminConfig:AdminConfigType;

  constructor( private metaDataService:MetaDataService ){}

  async init( adminConfig:() => Promise<AdminConfigType> ):Promise<any>{
    const metaData = await this.metaDataService.getMetaData();
    const defaultConfig = this.buildDefaultConfig( metaData );
    const config = await adminConfig();
    this.adminConfig = _.defaultsDeep( config, defaultConfig );
    return null;
  }

  getEntityConfig( path:string ):EntityConfigType {
    if( ! this.adminConfig ) throw new Error(`AdminService not yet initialized`);
    return _.get( this.adminConfig, ['entities', path] );
  }

  private buildDefaultConfig( metaData:any[] ):AdminConfigType {
    return _.set( {}, 'entities', _.reduce( metaData, (adminConfig, data) => {
      return _.set( adminConfig, data.path, this.buildEntityConfig( data ));
    }, {} ));
  }

  private buildEntityConfig( data:any ):EntityConfigType {
    const typeQuery = data.typeQuery;
    const typesQuery = data.typesQuery;
    const fields = _.reduce( data.fields, (fields,data) => _.set(fields, data.name, this.buildField(data)), {} );
    return { typeQuery, typesQuery, fields };
  };

  private buildField( data:any ):FieldConfigType {
    return {
      name: data.name,
      label: inflection.humanize( data.name ),
      type: data.type,
      required: data.required,
      virtual: data.virtual,
      unique: data.unique
    };
  }

}
