import * as inflection from 'inflection';
import * as _ from 'lodash';

export type AdminConfigType = {
  entities?:{ [entity:string]:EntityConfigType}
  menu?:string[]
}

export type EntityConfigType = {
  path?:string
  title?:string|((purpose?:TitlePurposeType)=>string)
  action?:(event:ActionEventType) => void
  fields?:{[name:string]:FieldConfigType}
  assocs?:{[name:string]:AssocType}
  entitesName?:string
  entityName?:string
  typesQuery?:string
  typeQuery?:string
  deleteMutation?:string
  updateMutation?:string
  updateInput?:string
  createMutation?:string
  createInput?:string,
  foreignKey?:string
  name?:( item:any ) => string
  index?:UiConfigType
  show?:UiConfigType
  form?:UiConfigType
}

export type AdminTableConfig = {
  title?:string|(()=>string)
  fields?:(string|FieldConfigType)[]
  actions?:{[name:string]:AdminTableActionConfig}
  defaultActions?:('show'|'edit'|'delete')[]
  search?:boolean
}

export type UiConfigType = AdminTableConfig & {
  query?:string
  assoc?:AssocConfigType[]
  data?:AssocConfigType[]
  table?:AssocTableConfigType[]
}

export type AdminTableActionConfig = {
  icon?:string
  text?:string
  onAction:(item:any) => void
}

export type FieldFilterConfigType = {
  value?:(item:any) => any | any[]
  multiple?:boolean
}

export type FieldConfigType = {
  name?:string
  path?:string
  label?:string|(() => string)
  value?:(item:any) => string|object[]
  filter?:boolean|FieldFilterConfigType
  link?:(item:any) => any[]
  searchable?:boolean
  sortable?:boolean
  parent?:string
  control?:string
  values?:(data:any) => {value:any, label:string}[]
  required?:boolean
  virtual?:boolean
  type?:string,
  unique?:boolean,
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
  required?:boolean
}

export type ActionEventType = {id:any, action:string};

export type TitlePurposeType = 'menu'|'index'|'show'|'edit'|'detailTable'





/**
 *
 */
export class AdminConfig {

  private static adminConfig:AdminConfig;
  private constructor(){}

  static getInstance() {
    if( _.isUndefined( this.adminConfig ) ) this.adminConfig = new AdminConfig();
    return this.adminConfig;
  }

  async getConfig( metaData:any, adminConfig:() => Promise<AdminConfigType> ){
    const defaultConfig = this.buildDefaultConfig( metaData );
    const config = await adminConfig();
    _.defaultsDeep( config, defaultConfig );
    this.setUiConfigDefaults( config );
    this.setAssocTableDefaults( config );
    return config;
  }

  private buildDefaultConfig( metaData:any[] ):AdminConfigType {
    return _.set( {}, 'entities', _.reduce( metaData, (entities, data) => {
      return _.set( entities, data.path, this.buildEntityConfig( data ));
    }, {} ));
  }

  private buildEntityConfig( data:any ):EntityConfigType {
    const fields = _.reduce( data.fields, (fields,data) =>
      _.set(fields, data.name, this.buildField(data)), {} );
    const assocs = _.reduce( data.assocTo, (assocs, assocTo) =>
      _.set( assocs, assocTo.path, assocTo ), {} );
    _.reduce( data.assocToMany, (assocs, assocToMany) =>
      _.set( assocs, assocToMany.path, assocToMany ), assocs );
    _.reduce( data.assocFrom, (assocs, assocFrom) =>
      _.set( assocs, assocFrom.path, assocFrom ), assocs );
    const config = _.pick( data,
      [ 'path', 'typeQuery', 'typesQuery', 'deleteMutation',
        'updateInput', 'updateMutation', 'createInput', 'createMutation', 'foreignKey']);
    return _.merge( config, { fields, assocs } );
  };

  private buildField( data:any ):FieldConfigType {
    return _.pick( data, ['name', 'type', 'required', 'virtual', 'unique']);
  }

  private setUiConfigDefaults( config:AdminConfigType ):void {
    _.forEach( config.entities, config => {
      _.forEach( ['index','show','form'], uiType => this.setDefaults( config, uiType ) );
    });
  }

  private setDefaults( config:EntityConfigType, uiType:string ):EntityConfigType {
    if( ! _.has(config, uiType ) ) _.set( config, uiType, {} );
    const uiConfig:UiConfigType = _.get( config, uiType );
    if( ! _.has( uiConfig, 'query' ) ) _.set( uiConfig, 'query',
      uiType === 'index' ? config.typesQuery : config.typeQuery );
    this.setFieldsDefaults( uiConfig, config );
    if( _.isUndefined( uiConfig.search ) ) uiConfig.search = true;
    return config;
  }

  private setFieldsDefaults( uiConfig:UiConfigType|AssocTableConfigType, entityConfig:EntityConfigType ):void {
    if( ! _.has( uiConfig, 'fields') ) _.set( uiConfig, 'fields',
      _.concat( _.keys(entityConfig.fields), _.keys( entityConfig.assocs ) ) );
    uiConfig.fields = _.compact( _.map( uiConfig.fields, field => this.setFieldDefault( field, entityConfig ) ) );
  }

  private setFieldDefault( field:string|FieldConfigType, entityConfig:EntityConfigType):FieldConfigType|undefined {
    return ! _.isString( field ) ? field :
      _.has( entityConfig.fields, field ) ? { name: field } :
      _.has( entityConfig.assocs, field ) ? { path: field } :
      undefined;
  }

  private setAssocTableDefaults( config:AdminConfigType ):void {
    _.forEach( config.entities, entityConfig => {
      _.forEach( ['index','show','form'], uiType => {
        const uiConfig:UiConfigType = entityConfig[uiType];
        _.forEach( uiConfig.table, table => {
          const tableEntityConfig = config.entities[table.path];
          if( ! tableEntityConfig ) return console.warn(`no such tableEntityConfig '${table.path}'`);
          this.setFieldsDefaults( table, tableEntityConfig );
         });
      } );
    });
  }

}
