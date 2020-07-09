import * as inflection from 'inflection';
import * as _ from 'lodash';

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
  parent?:string
}

export type UiConfigType = AdminTableConfig & {
  query?:string
  assoc?:AssocConfigType[]
  table?:AssocTableConfigType[]
}

export type AdminTableActionConfig = {
  icon?:string
  text?:string
  onAction:(item:any) => void
}

export type AdminTableConfig = {
  title?:string|(()=>string)
  fields?:(string|FieldConfigType)[]
  actions?:{[name:string]:AdminTableActionConfig}
  defaultActions?:('show'|'edit'|'delete')[]
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
  required?:boolean
}

export type AssocsType = {
  [assoc:string]:AssocType
}

export type ActionEventType = {id:any, action:string};

export type TitlePurposeType = 'menu'|'index'|'show'|'edit'|'detailTable'

export type FormFieldConfigType = {
  name?:string
  path?:string
  label?:string|(() => string)
  control?:string
  values?:(data:any) => {value:any, label:string}[]
  required?:boolean
  virtual?:boolean
}

export type FormConfigType = {
  data?:AssocConfigType[]
  fields?:(string|FormFieldConfigType)[]
}

export type EntityConfigType = {
  path?:string
  title?:string|((purpose?:TitlePurposeType)=>string)
  action?:(event:ActionEventType) => void
  fields?:FieldsMetaDataType
  assoc?:AssocsType
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
  name?:(item:any, action?:ActionType ) => string
  index?:UiConfigType
  show?:UiConfigType
  edit?:UiConfigType
  create?:UiConfigType
  form?:FormConfigType
}
export type AdminConfigType = {
  entities?:{ [entity:string]:EntityConfigType}
  menu?:string[]
}

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
    const assoc = _.reduce( data.assocTo, (assocs, assocTo) =>
      _.set( assocs, assocTo.path, assocTo ), {} );
    _.reduce( data.assocToMany, (assocs, assocToMany) =>
      _.set( assocs, assocToMany.path, assocToMany ), assoc );
    _.reduce( data.assocFrom, (assocs, assocFrom) =>
      _.set( assocs, assocFrom.path, assocFrom ), assoc );
    const config = _.pick( data,
      [ 'path', 'typeQuery', 'typesQuery', 'deleteMutation',
        'updateInput', 'updateMutation', 'createInput', 'createMutation', 'foreignKey']);
    return _.merge( config, { fields, assoc } );
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

  private setUiConfigDefaults( config:AdminConfigType ):void {
    _.forEach( config.entities, config => {
      _.forEach( ['index','show','edit','create'], uiType => this.setDefaults( config, uiType ) );
    });
  }

  private setDefaults( config:EntityConfigType, uiType:string ):EntityConfigType {
    if( ! _.has(config, uiType ) ) _.set( config, uiType, {} );
    const uiConfig:UiConfigType = _.get( config, uiType );
    if( ! _.has( uiConfig, 'query' ) ) _.set( uiConfig, 'query',
      uiType === 'index' ? config.typesQuery : config.typeQuery );
    this.setFieldDefaults( uiConfig, config );
    if( _.isUndefined( uiConfig.search ) ) uiConfig.search = true;
    return config;
  }

  private setFieldDefaults( uiConfig:UiConfigType|AssocTableConfigType, entityConfig:EntityConfigType ):void {
    if( ! _.has( uiConfig, 'fields') ) _.set( uiConfig, 'fields', entityConfig ? _.keys(entityConfig.fields) : [] );
    uiConfig.fields = _.map( uiConfig.fields, field => _.isString( field ) ? { name: field } : field );
  }

  private setAssocTableDefaults( config:AdminConfigType ):void {
    _.forEach( config.entities, entityConfig => {
      _.forEach( ['index','show','edit','create'], uiType => {
        const uiConfig:UiConfigType = entityConfig[uiType];
        _.forEach( uiConfig.table, table => {
          const tableEntityConfig = config.entities[table.path];
          if( ! tableEntityConfig ) return console.warn(`no such tableEntityConfig '${table.path}'`);
          this.setFieldDefaults( table, tableEntityConfig );
         });
      } );
    });
  }

}
