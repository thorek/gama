import { GraphQLUpload } from 'apollo-server-express';
import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLString,
  GraphQLType,
  GraphQLUnionType,
} from 'graphql';
import _, { Dictionary } from 'lodash';

import { Runtime } from '../core/runtime';
import { AssocToType, AssocType, Entity } from '../entities/entity';
import { TypeAttribute } from '../entities/type-attribute';
import { FilterType } from './filter-type';
import { TypeBuilder } from './schema-builder';

const scalarTypes:{[scalar:string]:GraphQLScalarType} = {
  id: GraphQLID,
  string: GraphQLString,
  int: GraphQLInt,
  float: GraphQLFloat,
  boolean: GraphQLBoolean
}

type AttributePurpose = 'createInput'|'updateInput'|'filter'|'type';

type AttrFieldConfig = {
  type:GraphQLType
  description?:string
  resolve?:any
}

export class EntityBuilder extends TypeBuilder {

  name() { return this.entity.name }
  get resolver() { return this.entity.resolver }
  attributes():{[name:string]:TypeAttribute} { return this.entity.attributes };

  /**
   *
   */
  constructor( public readonly entity:Entity ){ super() }

  /**
   *
   */
  init( runtime:Runtime ){
    super.init( runtime );
    this.entity.init( runtime );
  }

  //
  //
  public build():void {
    if( this.entity.isUnion ) return;
    const from = this.entity.isInterface ? GraphQLInterfaceType : GraphQLObjectType;
    const name = this.entity.typeName;
    this.graphx.type( name, {
      from, name,
      fields: () => {
        const fields = { id: { type: new GraphQLNonNull(GraphQLID) } };
        return _.merge( fields, this.getAttributeFields( 'type' ) );
      },
      description: this.entity.description
    });
  }

  //
  //
  extendTypes():void {
    this.createEntityTypesEnum();
    this.createCreateInputType();
    this.createUpdateInputType();
    this.createFilterType();
    this.createSortType();
    this.addInterfaces();
    this.addReferences();
    this.addQueries();
    this.addMutations();
  }

  //
  //
  createUnionType():void {
    if( ! this.entity.isUnion ) return;
    const name = this.entity.typeName;
    this.graphx.type( name, {
      from: GraphQLUnionType,
      name,
      types: () => _.compact( _.map( this.getSpecificEntities( this.entity),
        entity => this.graphx.type( entity.typeName) ) ),
      description: this.entity.description
    });
  }

  getSpecificEntities( entity:Entity ):Entity[]{
    if( ! entity.isPolymorph ) return [entity];
    return _.flatten( _.map( entity.entities, e => this.getSpecificEntities(e) ) );
  }

  //
  //
  protected createEntityTypesEnum():void {
    if( ! this.entity.isPolymorph ) return;
    const entities = this.getSpecificEntities( this.entity );
    const values = _.reduce( entities, (values, entity) =>
      _.set( values, entity.name, {value: entity.name } ), {} );
    const name = this.entity.typesEnumName;
    this.graphx.type( name, { name, values, from: GraphQLEnumType });
  }

  //
  //
  protected addInterfaces():void {
    if( _.isEmpty( this.entity.implements ) ) return;
    _.forEach( this.entity.implements, entity => {
      this.addFieldsFromInterface( entity );
      this.addAssocTo( entity );
      this.addAssocToMany( entity );
      this.addAssocFrom( entity );
    });
    _.set( this.graphx.type(this.entity.typeName), 'interfaceTypes',
      () => _.map( this.entity.implements, entity => this.graphx.type(entity.typeName)) );
  }

  //
  //
  protected addFieldsFromInterface( entity:Entity ):void {
    this.graphx.type(this.entity.typeName).extendFields( () => this.getAttributeFields( 'type', entity ) );
    this.graphx.type(this.entity.filterName).extendFields( () => this.getAttributeFields( 'filter', entity ) );
    this.graphx.type(this.entity.createInput).extendFields( () => this.getAttributeFields( 'createInput', entity ) );
    this.graphx.type(this.entity.updateInput).extendFields( () => this.getAttributeFields( 'updateInput', entity ) );
  }

  //
  //
  protected addReferences():void {
    this.addAssocTo();
    this.addAssocToMany();
    this.addAssocFrom();
  }

  //
  //
  protected addMutations():void {
    this.addSaveMutations();
    this.addDeleteMutation();
  }

  //
  //
  addQueries():void  {
    if( ! this.entity.isPolymorph ) this.addTypeQuery();
    this.addTypesQuery();
  }

  //
  //
  protected addAssocTo( entity?:Entity ):void {
    if( ! entity ) entity = this.entity;
    let assocTo = _.filter( entity.assocTo, bt => this.checkReference( 'assocTo', bt ) );
    this.graphx.type(this.entity.typeName).extendFields(
      () => _.reduce( assocTo, (fields, ref) => this.addAssocToReferenceToType( fields, ref ), {} ));
    this.graphx.type(this.entity.createInput).extendFields(
      () => _.reduce( assocTo, (fields, ref) => this.addAssocToForeignKeyToInput( fields, ref ), {} ));
    this.graphx.type(this.entity.createInput).extendFields(
      () => _.reduce( assocTo, (fields, ref) => this.addAssocToInputToInput( fields, ref ), {} ));
    this.graphx.type(this.entity.updateInput).extendFields(
      () => _.reduce( assocTo, (fields, ref) => this.addAssocToForeignKeyToInput( fields, ref ), {} ));
    this.graphx.type(this.entity.filterName).extendFields( // re-use input for filter intentionally
      () => _.reduce( assocTo, (fields, ref) => this.addAssocToForeignKeyToInput( fields, ref ), {} ));
  }

  //
  //
  protected addAssocToMany(entity?:Entity ):void {
    if( ! entity ) entity = this.entity;
    const assocToMany = _.filter( entity.assocToMany, bt => this.checkReference( 'assocTo', bt ) );
    this.graphx.type(this.entity.typeName).extendFields(
      () => _.reduce( assocToMany, (fields, ref) => this.addAssocToManyReferenceToType( fields, ref ), {} ));
    this.graphx.type(this.entity.createInput).extendFields(
      () => _.reduce( assocToMany, (fields, ref) => this.addAssocToManyForeignKeysToInput( fields, ref ), {} ));
    this.graphx.type(this.entity.updateInput).extendFields(
      () => _.reduce( assocToMany, (fields, ref) => this.addAssocToManyForeignKeysToInput( fields, ref ), {} ));
    this.graphx.type(this.entity.filterName).extendFields( // re-use input for filter intentionally
      () => _.reduce( assocToMany, (fields, ref) => this.addAssocToManyForeignKeysToInput( fields, ref ), {} ));
    }

  //
  //
  private addAssocToForeignKeyToInput( fields:any, ref:AssocType ):any {
    const refEntity = this.runtime.entities[ref.type];
    _.set( fields, refEntity.foreignKey, { type: GraphQLID });
    if( refEntity.isPolymorph ) _.set( fields, refEntity.typeField,
      { type: this.graphx.type( refEntity.typesEnumName ) } );
    return fields;
  }


  //
  //
  private addAssocToInputToInput( fields:any, ref:AssocToType ):any {
    if( ref.input ) {
      const refEntity = this.runtime.entities[ref.type];
      _.set( fields, refEntity.typeQuery, {type: this.graphx.type( refEntity.createInput )} );
    }
    return fields;
  }

  //
  //
  private addAssocToManyForeignKeysToInput( fields:any, ref:AssocType ):any {
    const refEntity = this.runtime.entities[ref.type];
    return _.set( fields, refEntity.foreignKeys, { type: GraphQLList( GraphQLID ) });
  }

  //
  //
  private addAssocToReferenceToType( fields:any, ref:AssocType ):any {
    const refEntity = this.runtime.entities[ref.type];
    const refObjectType = this.graphx.type(refEntity.typeName);
    return _.set( fields, refEntity.typeQuery, {
      type: refObjectType,
      resolve: (root:any, args:any, context:any ) =>
        this.resolver.resolveAssocToType( refEntity, {root, args, context} )
    });
  }

  //
  //
  private addAssocToManyReferenceToType( fields:any, ref:AssocType ):any {
    const refEntity = this.runtime.entities[ref.type];
    const refObjectType = this.graphx.type(refEntity.typeName);
    return _.set( fields, refEntity.plural, {
      type: new GraphQLList( refObjectType),
      resolve: (root:any, args:any, context:any ) =>
        this.resolver.resolveAssocToManyTypes( refEntity, {root, args, context} )
    });
  }

  //
  //
  protected addAssocFrom( entity?:Entity ):void {
    if( ! entity ) entity = this.entity;
    const assocFrom = _.filter( entity.assocFrom, assocFrom => this.checkReference( 'assocFrom', assocFrom ) );
    this.graphx.type(this.entity.typeName).extendFields(
      () => _.reduce( assocFrom, (fields, ref) => this.addAssocFromReferenceToType( fields, ref ), {} ));
  }

  //
  //
  private addAssocFromReferenceToType(fields:any, ref:AssocType):any {
    const refEntity = this.runtime.entities[ref.type];
    const refObjectType = this.graphx.type(refEntity.typeName)
    return _.set( fields, refEntity.plural, {
      type: new GraphQLList( refObjectType ),
      resolve: (root:any, args:any, context:any ) =>
        this.resolver.resolveAssocFromTypes( refEntity, {root, args, context} )
    });
  }

  //
  //
  private checkReference( direction:'assocTo'|'assocFrom', ref:AssocType ):boolean {
    const refEntity = this.runtime.entities[ref.type];
    if( ! (refEntity instanceof Entity ) ) {
      console.warn( `'${this.entity.typeName}:${direction}': no such entity type '${ref.type}'` );
      return false;
    }
    if( ! this.graphx.type(refEntity.typeName) ) {
      console.warn( `'${this.entity.typeName}:${direction}': no objectType in '${ref.type}'` );
      return false;
    }
    return true;
  }

  /**
   *
   */
  protected createCreateInputType():void {
    const name = this.entity.createInput;
    this.graphx.type( name, { name, from: GraphQLInputObjectType, fields: () => {
      let fields = this.getAttributeFields( 'createInput' );
      // the following is to prevent strange effects with a type definition w/o fields, which could happen under
      // some error cases, but we dont want the schema creation to fails
      if( _.isEmpty(fields) ) fields = { _generated: { type: new GraphQLNonNull(GraphQLString) } };
      return fields;
    } });
  }

  /**
   *
   */
  protected createUpdateInputType():void {
    const name = this.entity.updateInput;
    this.graphx.type( name, { name, from: GraphQLInputObjectType, fields: () => {
      const fields = { id: { type: new GraphQLNonNull(GraphQLID) }};
      return _.merge( fields, this.getAttributeFields( 'updateInput' ) );
    }});
  }

  /**
   *
   */
  protected getAttributeFields( purpose:AttributePurpose, entity?:Entity ):Dictionary<AttrFieldConfig> {
    const attributes = entity ? entity.attributes : this.attributes();
    const fields = _.mapValues( attributes, (attribute, name) => this.getFieldConfig(name, attribute, purpose));
    if( _.includes(['type', 'filter'], purpose) ) this.addTimestampFields( fields, purpose );
    return _.pickBy( fields, _.identity) as Dictionary<AttrFieldConfig>;
  }

  //
  //
  private addTimestampFields( fields:Dictionary<AttrFieldConfig|undefined>, purpose:AttributePurpose ) {
    _.set( fields, 'createdAt', this.getFieldConfig( 'createdAt', { graphqlType: 'string' }, purpose ) );
    _.set( fields, 'updatedAt', this.getFieldConfig( 'updatedAt', { graphqlType: 'string' }, purpose ) );
  }

  //
  //
  private getFieldConfig(name:string, attribute:TypeAttribute, purpose:AttributePurpose ):AttrFieldConfig|undefined {
    if( _.includes(['createInput', 'updateInput'], purpose) && this.entity.isFileAttribute( attribute ) ) return;
    const addNonNull = this.addNonNull( name, attribute, purpose);
    const fieldConfig = {
      type: this.getGraphQLType(attribute, addNonNull, purpose ),
      description: attribute.description
    };
    if( this.skipCalculatedAttribute( name, attribute, purpose, fieldConfig ) ) return;
    return fieldConfig;
  }

  //
  //
  private addNonNull( name:string, attribute:TypeAttribute, purpose:AttributePurpose ):boolean {
    if( ! attribute.required || _.includes(['filter', 'updateInput'], purpose ) ) return false;
    if( attribute.required === true ) return _.includes( ['createInput', 'type'], purpose );
    if( attribute.required === 'create' ) return _.includes( ['createInput', 'type'], purpose );
    if( attribute.required === 'update' ) return false
    throw `unallowed required attribute for '${this.entity.name}:${name}'`;
  }

  //
  //
  private skipCalculatedAttribute(name:string, attribute:TypeAttribute, purpose:AttributePurpose, fieldConfig:AttrFieldConfig ):boolean {
    if( ! _.isFunction( attribute.calculate ) ) return false;
    if( purpose !== 'type' ) return true;
    fieldConfig.resolve = attribute.calculate
    return false;
  }

  /**
   *
   */
  protected createFilterType():void {
    const name = this.entity.filterName;
    this.graphx.type( name, { name, from: GraphQLInputObjectType, fields: () => {
      const fields = { id: { type: GraphQLID } };
      _.forEach( this.attributes(), (attribute, name) => {
        if( _.isFunction( attribute.calculate ) ) return;
        const filterType = this.getFilterType(attribute);
        if( filterType ) _.set( fields, name, { type: filterType } );
      });
      return fields;
    }});
  }

  /**
   *
   */
  protected createSortType():void {
    const name = this.entity.sorterEnumName;
    const values = _(this.attributes()).
      map( (attribute, name ) => _.isFunction(attribute.calculate) ? [] : [`${name}_ASC`, `${name}_DESC`] ).
      flatten().compact().
      concat( ['id_ASC', 'id_DESC']).
      reduce( (values, item) => _.set( values, item, {value: item} ), {} );
    this.graphx.type( name, { name, values, from: GraphQLEnumType });
  }

  /**
   *
   */
  protected addTypeQuery(){
    const typeQuery = this.entity.typeQuery;
    if( ! typeQuery ) return;
    this.graphx.type( 'query' ).extendFields( () => {
      return _.set( {}, typeQuery, {
        type: this.graphx.type(this.entity.typeName),
        args: { id: { type: GraphQLID } },
        resolve: ( root:any, args:any, context:any ) => this.resolver.resolveType( {root, args, context} )
      });
    });
  }

  /**
   *
   */
  protected addTypesQuery(){
    const typesQuery = this.entity.typesQuery;
    if( ! typesQuery ) return;
    this.graphx.type( 'query' ).extendFields( () => {
      return _.set( {}, typesQuery, {
        type: new GraphQLList( this.graphx.type(this.entity.typeName) ),
        args: {
          filter: { type: this.graphx.type(this.entity.filterName) },
          sort: { type: this.graphx.type(this.entity.sorterEnumName) },
          paging: { type: this.graphx.type( 'EntityPaging' ) }
        },
        resolve: (root:any, args:any, context:any) => this.resolver.resolveTypes( {root, args, context} )
      });
    });
  }

  /**
   *
   */
  protected addSaveMutations():void {
    if( this.entity.isPolymorph ) return;
    const type = new GraphQLObjectType( { name: this.entity.mutationResultName, fields: () => {
      const fields = { validationViolations: {
          type: new GraphQLNonNull( new GraphQLList( this.graphx.type('ValidationViolation')) ) } };
      return _.set( fields, this.entity.typeQuery, {type: this.graphx.type(this.entity.typeName) } );
    }});
    this.addCreateMutation( type );
    this.addUpdateMutation( type );
  }

  /**
   *
   */
  protected addCreateMutation(  type:GraphQLType ):void{
    this.graphx.type( 'mutation' ).extendFields( () => {
      const args = _.set( {}, this.entity.typeQuery, { type: this.graphx.type(this.entity.createInput)} );
      this.addFilesToSaveMutation( args );
      return _.set( {}, this.entity.createMutation, {
        type,	args, resolve: (root:any, args:any, context:any ) => this.resolver.saveType( {root, args, context} )
      });
    });
  }

  /**
   *
   */
  protected addUpdateMutation(  type:GraphQLType ):void{
    this.graphx.type( 'mutation' ).extendFields( () => {
      const args = _.set( {}, this.entity.typeQuery, { type: this.graphx.type(this.entity.updateInput)} );
      this.addFilesToSaveMutation( args );
      return _.set( {}, this.entity.updateMutation, {
        type,	args, resolve: (root:any, args:any, context:any ) => this.resolver.saveType( {root, args, context} )
      });
    });
  }

  /**
   *
   */
  private addFilesToSaveMutation( args:any ){
    _.forEach( this.entity.attributes, (attribute, name ) => {
      if( this.entity.isFileAttribute( attribute) ) _.set( args, name, { type: GraphQLUpload } );
    });
  }

  /**
   *
   */
  protected addDeleteMutation():void {
    this.graphx.type( 'mutation' ).extendFields( () => {
      return _.set( {}, this.entity.deleteMutation, {
        type: new GraphQLList( GraphQLString ),
        args: { id: { type: GraphQLID } },
        resolve: (root:any, args:any, context:any ) => this.resolver.deleteType( {root, args, context} )
      });
    });
  }

  /**
   *
   */
  private getGraphQLType( attr:TypeAttribute, addNonNull:boolean, purpose:AttributePurpose ):GraphQLType {
    const type = _.isString( attr.graphqlType ) ? this.getTypeForName(attr.graphqlType, purpose ) : attr.graphqlType;
    return addNonNull ? new GraphQLNonNull( type ) : type;
  }

  /**
   *
   */
  private getTypeForName( name:string, purpose:AttributePurpose ):GraphQLType {
    const type = this.getScalarType( name, purpose );
    if( type ) return type;
    try {
      return this.graphx.type(name);
    } catch (error) {
      console.error(`no such graphqlType:`, name, ` - using GraphQLString instead` );
    }
    return GraphQLString;
  }

  /**
   *
   */
  private getScalarType( name:string, purpose:AttributePurpose ):GraphQLScalarType | undefined {
    if( name === 'file' && _.includes(['createInput', 'updateInput'], purpose) ) return GraphQLUpload as GraphQLScalarType;
    const type = scalarTypes[_.toLower(name)];
    if( type ) return type;
  }

  /**
   *
   */
  private getFilterType( attr:TypeAttribute):FilterType|undefined {
    if( attr.filterType === false ) return;
    if( ! attr.filterType ){
      let typeName = _.isString( attr.graphqlType ) ? attr.graphqlType : _.get(attr.graphqlType, 'name' ) as string;
      typeName = `${_.toUpper(typeName.substring(0,1))}${typeName.substring(1)}`;
      attr.filterType = TypeBuilder.getFilterName( typeName );
    }
    if( ! _.isString( attr.filterType ) ) return attr.filterType;
    try {
      return this.runtime.graphx.type(attr.filterType);
    } catch (error) {
      console.error(`no such filterType:`, attr.filterType, ` - skipping filter`,  );
    }
  }

}
