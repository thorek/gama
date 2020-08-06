import _ from 'lodash';

import { Entity, AssocFromType, AssocToType, AssocToManyType } from './entity';
import { TypeAttribute } from './type-attribute';
import { EntityPermissionType } from './entity-permissions';
import { Context } from '../core/context';

/**
 *
 */
export type AttributeConfig = {
  type:string;
  key?:string;
  filterType?:string|boolean;
  validation?:any;
  required?:boolean|'create'|'update'
  unique?:boolean|string
  description?:string
  virtual?:boolean
  input?:boolean
  default?:any

  label?:string
  sortable?:string
  mediaType?:'image'|'video'|'audio'
}

export type SeedEvalContextType = {
  idsMap?:any
  seed:any
  context:Context
}

export type SeedConfigType = {
  [attribute:string]:object|(( evalContext:SeedEvalContextType) => any)
}

export type EntityConfig  = {
  typeName?:string;

  attributes?:{[name:string]:string|AttributeConfig};
  assocTo?:string|(string|AssocToType)[];
  assocToMany?:string|(string|AssocToManyType)[];
  assocFrom?:string|string[]|AssocFromType[];

  plural?:string
  singular?:string;

  collection?:string;
  instance?:string;
  label?:string;
  path?:string;
  parent?:string;

  seeds?:{[seedId:string]:SeedConfigType}
  permissions?:null|EntityPermissionType
  equality?:null|string|{[typeName:string]:string[]}
  description?:string

  union?:string[]
  interface?:boolean
  implements?:string|string[]
}

/**
 *
 */
export class ConfigEntity extends Entity {

  _attributes?:{[name:string]:TypeAttribute} = undefined

  /**
   *
   */
  static create( name:string, entityConfig:EntityConfig ):ConfigEntity {
    return new ConfigEntity( name, entityConfig );
  }

  /**
   *
   */
  protected  constructor(
      protected readonly _name:string,
      public readonly entityConfig:EntityConfig ){
   super();
  }

  protected getName() { return this._name }
  protected getTypeName() { return this.entityConfig.typeName || super.getTypeName() }
  protected getAttributes() {
    if( ! this.entityConfig.attributes ) return super.getAttributes();
    if( ! this._attributes ) {
      const attributes = _.mapValues( this.entityConfig.attributes, (attrConfig, name) => this.buildAttribute( name, attrConfig ) );
      this._attributes = _.pickBy( attributes, _.identity ) as {[name:string]:TypeAttribute};
    }
    return this._attributes;
  }
  protected getAssocTo() {
    if( ! this.entityConfig.assocTo ) return super.getAssocTo();
    if( ! _.isArray( this.entityConfig.assocTo) ) this.entityConfig.assocTo = [this.entityConfig.assocTo];
    return _.map( this.entityConfig.assocTo, assocTo => {
      if( _.isString( assocTo ) ) assocTo = { type : assocTo }
      if( _.endsWith( assocTo.type, '!' ) ){
        assocTo.type = assocTo.type.slice(0, -1);
        assocTo.required = true;
      }
      return assocTo;
    });
  }
  protected getAssocToMany() {
    if( ! this.entityConfig.assocToMany ) return super.getAssocToMany();
    if( ! _.isArray( this.entityConfig.assocToMany) ) this.entityConfig.assocToMany = [this.entityConfig.assocToMany];
    return _.map( this.entityConfig.assocToMany, bt => {
      return _.isString(bt) ? { type: bt } : bt;
    });
  }
  protected getAssocFrom(){
    if( ! this.entityConfig.assocFrom ) return super.getAssocFrom();
    if( ! _.isArray( this.entityConfig.assocFrom) ) this.entityConfig.assocFrom = [this.entityConfig.assocFrom];
    if( ! _.isArray( this.entityConfig.assocFrom ) ){
      console.warn(`'${this.name}' assocFrom must be an array but is: `, this.entityConfig.assocFrom );
      return super.getAssocFrom();
    }
    return _.map( this.entityConfig.assocFrom, hm => {
      return _.isString(hm) ? { type: hm } : hm;
    }) as AssocFromType[];
   }
  protected getPlural() { return this.entityConfig.plural || super.getPlural() }
  protected getSingular() { return this.entityConfig.singular || super.getSingular() }
  protected getCollection() { return this.entityConfig.collection || super.getCollection() }
  protected getSeeds() { return this.entityConfig.seeds || super.getSeeds() }
  protected getPermissions() { return this.entityConfig.permissions || super.getPermissions() }
  protected getEquality() {
    const sr = this.entityConfig.equality;
    if( ! sr ) return super.getEquality();
    return _.isString( sr ) ? _.set( {}, sr, _.map( this.assocTo, bt => bt.type ) ) : sr;
  }
  protected getDescription():string|undefined { return this.entityConfig.description || super.getDescription() }
  protected getEntites():Entity[] {
    if( this.isInterface ) return _.filter( this.context.entities, entity => entity.implementsEntityInterface( this ) );
    return _.compact( _.map( this.entityConfig.union, entity => this.context.entities[entity] ) );
  }
  protected getImplements():Entity[] {
    if( ! this.entityConfig.implements ) return super.getImplements();
    if( ! _.isArray( this.entityConfig.implements ) ) this.entityConfig.implements = [this.entityConfig.implements];
    return _.compact( _.map( this.entityConfig.implements, entity => this.context.entities[entity] ) );
  }
  protected getIsInterface():boolean { return this.entityConfig.interface === true }

  /**
   *
   */
  private buildAttribute( name:string, attrConfig:AttributeConfig|string ):TypeAttribute {
    attrConfig = this.resolveShortcut( attrConfig );
    this.resolveKey( attrConfig );
    this.resolveScopedKey( attrConfig );
    this.resolveExclamationMark( attrConfig );
    this.resolveFilterType( attrConfig );
    this.warnVirtual( name, attrConfig );
    this.resolveMediaType( attrConfig );
    return {
      graphqlType: attrConfig.type,
      filterType: attrConfig.filterType as string|false|undefined,
      validation: attrConfig.validation,
      unique: attrConfig.unique,
      required: attrConfig.required,
      description: attrConfig.description,
      virtual: attrConfig.virtual,
      // input: attrConfig.input,
      defaultValue: attrConfig.default,
      mediaType: attrConfig.mediaType
    }
  }

  private resolveShortcut( attrConfig:string|AttributeConfig):AttributeConfig {
    if( _.isString( attrConfig ) ) attrConfig = { type: attrConfig };
    if( ! attrConfig.type ) attrConfig.type = 'string';
    return attrConfig;
  }

  private resolveKey( attrConfig:AttributeConfig ):void {
    if( _.toLower(attrConfig.type) === 'key' ){
      attrConfig.type = 'string';
      attrConfig.required = true;
      attrConfig.unique = true;
    }
  }

  private resolveScopedKey( attrConfig:AttributeConfig ):void {
    if( _.isString(attrConfig.key) ){
      attrConfig.type = 'string';
      attrConfig.required = true;
      attrConfig.unique = attrConfig.key;
    }
  }

  private resolveExclamationMark( attrConfig:AttributeConfig ):void {
    if( _.endsWith( attrConfig.type, '!' ) ){
      attrConfig.type = attrConfig.type.slice(0, -1);
      attrConfig.required = true;
    }
  }

  private resolveFilterType( attrConfig:AttributeConfig ):void {
    if( attrConfig.filterType === true ) attrConfig.filterType === undefined;
  }

  private resolveMediaType( attrConfig:AttributeConfig ):void {
    switch( attrConfig.type ){
      case 'Image':
        attrConfig.type = 'File';
        attrConfig.mediaType = 'image';
        break;
      case 'Video':
        attrConfig.type = 'File';
        attrConfig.mediaType = 'video';
        break;
      case 'Audio':
        attrConfig.type = 'File';
        attrConfig.mediaType = 'audio';
        break;
    }
  }

  private warnVirtual( name: string, attrConfig:AttributeConfig ):void {
    if( attrConfig.virtual ){
      if( attrConfig.filterType ) console.warn( this.name, `[${name}]`, 'filterType makes no sense for virtual attribute' )
    }
  }

}
