import * as inflection from 'inflection';
import * as _ from 'lodash';

const nameProperties = ['name', 'title', 'key', 'lastname', 'firstname', 'last_name', 'first_name'];

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

export type LinkValueType = {
  value:string
  link:string[]
}

export type FieldConfigType = {
  name?:string
  path?:string
  label?:string|(() => string)
  value?:(item:any) => string|LinkValueType|(string|LinkValueType)[]
  keyValue?:(item:any) => string|string[]
  filter?:boolean|FieldFilterConfigType
  link?:boolean|((item:any) => any[])
  searchable?:boolean
  sortable?:boolean
  parent?:string
  control?:string
  values?:(data:any) => {value:any, label:string}[]
  required?:boolean
  virtual?:boolean
  type?:string,
  unique?:boolean
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

export type TitlePurposeType = 'menu'|'index'|'show'|'form'|'detailTable'

export type SaveReturnType = {
  id?:string
  violations:ViolationType[]
}

export type ViolationType = {
  attribute:string
  message:string
}


/**
 *
 */
export class AdminConfig {

  private static adminConfig:AdminConfig;
  private constructor(){}
  private config:AdminConfigType;

  static getInstance() {
    if( _.isUndefined( this.adminConfig ) ) this.adminConfig = new AdminConfig();
    return this.adminConfig;
  }

  static guessNameValue = (item:any) => {
    const candidate = _.find( nameProperties, candidate => _.has( item, candidate ) );
    if( candidate ) return _.get( item, candidate );
    if( _.has( item, 'id' ) ) return `#${_.get(item, 'id' ) }`;
    return _.toString( item );
  }

  async getConfig( metaData:any, adminConfig:() => Promise<AdminConfigType> ){
    const defaultConfig = this.buildDefaultConfig( metaData );
    this.config = await adminConfig();
    this.config = _.defaultsDeep( this.config, defaultConfig );
    this.setUiConfigDefaults();
    this.setAssocTableDefaults();
    return this.config;
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

  private setUiConfigDefaults():void {
    _.forEach( this.config.entities, entityConfig => {
      if( _.isUndefined( entityConfig.name) ) entityConfig.name = AdminConfig.guessNameValue;
      _.forEach( ['index','show','form'], uiType => this.setDefaults( entityConfig, uiType ) );
      if( _.isUndefined( entityConfig.form.data ) ) entityConfig.form.data =
        _.compact( _.map( entityConfig.form.fields, (field:FieldConfigType) => field.path ) );

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
        _.map(
          _.filter( entityConfig.assocs, assoc => _.includes( ['assocTo', 'assocToMany'], assoc.type ) ),
          assoc => assoc.path )
      ));
    uiConfig.fields = _.compact( _.map( uiConfig.fields, field => this.setFieldDefault( field, entityConfig ) ) );
  }

  private setAssocTableDefaults():void {
    _.forEach( this.config.entities, entityConfig => {
      _.forEach( ['index','show','form'], uiType => {
        const uiConfig:UiConfigType = entityConfig[uiType];
        _.forEach( uiConfig.table, table => {
          const tableEntityConfig = this.config.entities[table.path];
          if( ! tableEntityConfig ) return console.warn(`no such tableEntityConfig '${table.path}'`);
          this.setFieldsDefaults( table, tableEntityConfig );
         });
      } );
    });
  }

  private setFieldDefault( field:string|FieldConfigType, entityConfig:EntityConfigType ):FieldConfigType | undefined {
    const fieldName = _.isString( field ) ? field : _.get( field, 'name' );
    const fieldConfig = entityConfig.fields[fieldName];
    if( fieldConfig ) return this.fieldFromEntityField( field, fieldConfig );
    const pathName = _.isString( field ) ? field : _.get( field, 'path' );
    const assoc = entityConfig.assocs[pathName];
    if( assoc ) return this.fieldFromAssoc( field, assoc, entityConfig );
    return this.warn( `neither field nor assoc : '${field}'`, undefined );
  }

  private fieldFromEntityField( field:string|FieldConfigType, fieldConfig:FieldConfigType ):FieldConfigType {
    if( _.isString( field ) ) field = { name: field };
    return _.defaults( field, fieldConfig );
  }

  private linkValue( field:FieldConfigType, assoc:AssocType, assocValue:any, name:( item:any )=> string ){
    if( _.isNil( assocValue ) ) return null;
    const link =
      field.link === false ? undefined :
      field.link ? field.link : ['/admin', assoc.path, 'show', assocValue.id ];
    return link ? { value: name(assocValue), link } : name(assocValue);
  }

  private fieldFromAssoc( field:string|FieldConfigType, assoc:AssocType, entityConfig:EntityConfigType ):FieldConfigType {
    if( _.isString( field ) ) field = { path: field };
    const assocEntityConfig = this.config.entities[assoc.path];
    if( ! assocEntityConfig ) return field;
    const values = (data:any) => _.map( _.get( data, assoc.typesQuery ), data => ({
      value: _.get( data, 'id'), label: assocEntityConfig.name( data ) }));
    const value = (item:any) => {
      const assocValue = _.get( item, assoc.query );
      return _.isArray( assocValue ) ?
        _.map( assocValue, value => this.linkValue( field as FieldConfigType, assoc, value, assocEntityConfig.name ) ) :
        this.linkValue( field as FieldConfigType, assoc, assocValue, assocEntityConfig.name );
    };
    const keyValue = (item:any) => {
      const assocValue = _.get( item, assoc.query );
      return _.isArray( assocValue ) ? _.map( assocValue, value => _.get(value, 'id' ) ) : _.get( assocValue, 'id' );
    }

    return _.defaults( field, { values, value, keyValue,
      control: assoc.type === 'assocTo' ? 'select' : assoc.type === 'assocToMany' ? 'tags' : undefined,
      label: inflection.humanize( assoc.query ), name: assoc.foreignKey, path: assoc.path, required: assoc.required } );
  }

  private warn<T>( message:string, type:T ):T {
    console.warn(message);
    return type;
  }

}
