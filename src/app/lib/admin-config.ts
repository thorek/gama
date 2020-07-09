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
  type:'assocTo'|'assocToMany'|'assocFrom'
  foreignKey:string
  typesQuery:string // for lookups
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
      _.set( assocs, assocTo.path, _.merge( assocTo, { type: 'assocTo' } ) ), {} );
    _.reduce( data.assocToMany, (assocs, assocToMany) =>
      _.set( assocs, assocToMany.path, _.merge( assocToMany, { type: 'assocToMany' } ) ), assocs );
    _.reduce( data.assocFrom, (assocs, assocFrom) =>
      _.set( assocs, assocFrom.path, _.merge( assocFrom, { type: 'assocFrom' } ) ), assocs );
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
      _.concat(
        _.keys( entityConfig.fields ),
        _.keys( _.filter( entityConfig.assocs, assoc => _.includes( ['assocTo', 'assocToMany'], assoc.type ) ) )
      ));
    uiConfig.fields = _.compact( _.map( uiConfig.fields, field => this.setFieldDefault( field, entityConfig ) ) );
  }

  // private setFieldDefault( field:string|FieldConfigType, entityConfig:EntityConfigType):FieldConfigType|undefined {
  //   return ! _.isString( field ) ? field :
  //     _.has( entityConfig.fields, field ) ? { name: field } :
  //     _.has( entityConfig.assocs, field ) ? { path: field } :
  //     undefined;
  // }

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


  // private prepareForm( config:EntityConfigType ){
  //   if( ! _.has( config, 'form' ) ) _.set( config, 'form', {} );
  //   if( ! _.has( config.form, 'fields' ) ) _.set( config.form, 'fields',
  //     _.concat( _.keys( config.assocs ) , _.keys( config.fields ) ) );
  //   config.form.fields = _.compact(
  //     _.map( config.form.fields, (field:FieldConfigType) => this.prepareFormField( field, config ) ) );
  // }

  private setFieldDefault( field:string|FieldConfigType, config:EntityConfigType ):FieldConfigType | undefined {
    const fieldName = _.isString( field ) ? field : _.get( field, 'name' );
    const fieldConfig = config.fields[fieldName];
    if( fieldConfig ) return this.fieldFromMetaField( field, fieldConfig );
    const pathName = _.isString( field ) ? field : _.get( field, 'path' );
    const assoc = config.assocs[pathName];
    if( assoc ) return this.fieldFromMetaAssoc( field, assoc );
    return this.warn( `neither field nor assoc : '${field}'`, undefined );
  }

  private fieldFromMetaField( field:string|FieldConfigType, fieldConfig:FieldConfigType ):FieldConfigType {
    if( _.isString( field ) ) field = { name: field };
    return _.defaults( field, fieldConfig );
  }

  private fieldFromMetaAssoc( field:string|FieldConfigType, assoc:AssocType ):FieldConfigType {
    if( _.isString( field ) ) field = { path: field };
    const values = (data:any) => _.map( _.get( data, assoc.typesQuery ), data => ({
      value: _.get( data, 'id'), label: _.get( data, 'name') // TODO
    }));
    const query = assoc.query;
    const value = (item:any) => {
      const assocValue = _.get( item, query );
      return _.isArray( assocValue ) ? _.map( assocValue, value => value.id ) : assocValue.id;
    };
    const label = inflection.humanize( query );
    const control =
      assoc.type === 'assocTo' ? 'select' :
      assoc.type === 'assocToMany' ? 'tags' :
      undefined;
    return _.defaults( field,
      { name: assoc.foreignKey, path: assoc.path, required: assoc.required, values, value, label, control } );
  }

  private warn<T>( message:string, type:T ):T {
    console.warn(message);
    return type;
  }

}
