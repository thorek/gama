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

export type FieldFilterConfigType = {
  value?:(item:any) => any | any[]
  multiple?: boolean
}

export type FieldConfigType = {
  name:string
  label?:string|(() => string)
  value?:(item:any) => string|object[]
  filter?:boolean|FieldFilterConfigType
  link?:(item:any) => any[]
  searchable?:boolean
  sortable?:boolean
}

export type UiConfigType = AdminTableConfig & {
  query?:string
  assoc?:AssocConfigType[]
  table?:AssocTableConfigType[]
}

export type AdminTableActionConfig = {}

export type AdminTableConfig = {
  title?:string|(()=>string)
  fields?:(string|FieldConfigType)[]
  actions?:AdminTableActionConfig[]
  search?:boolean
}

export type AssocTableConfigType = AdminTableConfig & {
  path:string
}

export type AssocConfigType = string| {
  path?:string
  fields?:string[]
  assoc?:AssocConfigType[]
}

export type AssocType = {
  path:string
  query:string
}

export type AssocsType = {
  [assoc:string]:AssocType
}

export type ActionEventType = {id:any, action:string};
export type TitlePurposeType = 'menu'|'index'|'show'|'edit'|'detailTable'

export type EntityConfigType = {
  path?:string
  title?:string|((purpose?:TitlePurposeType)=>string)
  action?:(event:ActionEventType) => void
  fields?:FieldsMetaDataType
  entitesName?:string
  entityName?:string
  typesQuery?:string
  typeQuery?:string
  deleteMutation?:string
  updateMutation?:string
  updateInput?:string
  createMutation?:string
  createInput?:string
  assoc?:AssocsType
  name?:(item:any, action?:ActionType ) => string
  index?:UiConfigType
  show?:UiConfigType
  edit?:UiConfigType
  create?:UiConfigType
}
export type AdminConfigType = {
  entities?:{ [entity:string]:EntityConfigType}
  menu?:string[]
}

@Injectable({providedIn: 'root'})
export class AdminService {

  private adminConfig:AdminConfigType;

  constructor( private metaDataService:MetaDataService ){}

  async init( adminConfig:() => Promise<AdminConfigType> ):Promise<any>{
    const metaData = await this.metaDataService.getMetaData();
    const defaultConfig = this.buildDefaultConfig( metaData );
    const config = await adminConfig();
    this.adminConfig = _.defaultsDeep( config, defaultConfig );
    _.forEach( this.adminConfig.entities, config => {
      _.forEach( ['index','show','edit','create'], uiType => this.setDefaults( config, uiType ) );
    })
    return null;
  }

  getMenuEntities():EntityConfigType[] {
    return this.adminConfig.menu ?
      _.compact( _.map( this.adminConfig.menu, item => this.adminConfig.entities[item] ) ) :
      _.values( this.adminConfig.entities );
  }

  getEntityConfig( path:string ):EntityConfigType {
    if( ! this.adminConfig ) throw new Error(`AdminService not yet initialized`);
    return _.get( this.adminConfig, ['entities', path] );
  }

  private buildDefaultConfig( metaData:any[] ):AdminConfigType {
    return _.set( {}, 'entities', _.reduce( metaData, (entities, data) => {
      return _.set( entities, data.path, this.buildEntityConfig( data ));
    }, {} ));
  }

  private buildEntityConfig( data:any ):EntityConfigType {
    const fields = _.reduce( data.fields, (fields,data) =>
      _.set(fields, data.name, this.buildField(data)), {} );
    const assoc = _.reduce( data.assocTo, (assocs, assocTo) =>
      _.set( assocs, assocTo.path, assocTo ), {} );
    _.reduce( data.assocToMany, (assocs, assocToMany) =>
      _.set( assocs, assocToMany.path, assocToMany ), assoc );
    _.reduce( data.assocFrom, (assocs, assocFrom) =>
      _.set( assocs, assocFrom.path, assocFrom ), assoc );
    const config = _.pick( data,
      [ 'path', 'typeQuery', 'typesQuery', 'deleteMutation',
        'updateInput', 'updateMutation', 'createInput', 'createMutation']);
    _.merge( config, { fields, assoc } );
    return config;
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

  private setDefaults( config:EntityConfigType, uiType:string ):EntityConfigType {
    if( ! _.has(config, uiType ) ) _.set( config, uiType, {} );
    const uiConfig:UiConfigType = _.get( config, uiType );
    if( ! _.has( uiConfig, 'query' ) ) _.set( uiConfig, 'query',
      uiType === 'index' ? config.typesQuery : config.typeQuery );
    this.setFieldDefaults( uiConfig, config );
    _.forEach( uiConfig.table, table => this.setFieldDefaults( table, table.path ) );
    if( _.isUndefined( uiConfig.search ) ) uiConfig.search = true;
    return config;
  }

  private setFieldDefaults( uiConfig:UiConfigType|AssocTableConfigType, entityConfig:EntityConfigType|string ):void {
    if( _.isString( entityConfig ) ) entityConfig = this.getEntityConfig( entityConfig );
    if( ! _.has( uiConfig, 'fields') ) _.set( uiConfig, 'fields', entityConfig ? _.keys(entityConfig.fields) : [] );
    uiConfig.fields = _.map( uiConfig.fields, field => _.isString( field ) ? { name: field } : field );

  }
}
  // const metaFields = _.keys(entityConfig.fields);
  // filter( (field:FieldConfigType) => _.includes( metaFields, field.name ) ).
