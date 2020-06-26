import * as _ from 'lodash';
import * as inflection from 'inflection';
import { Injectable } from '@angular/core';
import { MetaDataService } from './meta-data.service';

export type ActionType = 'index'|'show';

export type FieldMetaDataType = {
  name:string,
  type?:string,
  virtual?:boolean,
  unique?:boolean,
  required?:boolean,
  label?:string,
  value?:(entity:any, action?:ActionType) => any,
}

export type FieldsMetaDataType = {[field:string]:FieldMetaDataType}

export type FieldConfigType = {
  name:string
  label?:string|(() => string)
  value?:(item:any) => string
  link?:(item:any) => any[]
}

export type UiConfigType = {
  query?:string
  assoc?:{[assoc:string]:AssocUiConfigType}
  fields?:(string|FieldConfigType)[]
}

export type AssocUiConfigType = UiConfigType & {display?:string}

export type AssocType = {
  path:string
  query:string
}

export type AssocsType = {
  [assoc:string]:AssocType
}

export type EntityConfigType = {
  fields?:FieldsMetaDataType,
  entitesName?:string,
  entityName?:string,
  typesQuery?:string,
  typeQuery?:string,
  assoc?:AssocsType,
  name?:(entity:any, action?:ActionType ) => string,
  index?:UiConfigType
  show?:UiConfigType
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
    const fields = _.reduce( data.fields, (fields,data) =>
      _.set(fields, data.name, this.buildField(data)), {} );
    const assoc = _.reduce( data.assocTo, (assocs, assocTo) =>
      _.set( assocs, assocTo.path, assocTo ), {} );
    _.reduce( data.assocToMany, (assocs, assocToMany) =>
      _.set( assocs, assocToMany.path, assocToMany ), assoc );
    _.reduce( data.assocFrom, (assocs, assocFrom) =>
      _.set( assocs, assocFrom.path, assocFrom ), assoc );
    console.log( 3, data.path, {assocs: assoc})
    return { typeQuery, typesQuery, fields, assoc };
  };

  private buildField( data:any ):FieldMetaDataType {
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
