import _ from 'lodash';

import { Validator } from '../validation/validator';
import { Entity, EntityReference } from './entity';
import { TypeAttribute } from './type-attribute';
import { NotFoundError } from './entity-accessor';

//
//
export type ValidationViolation = {
  attribute?: string,
  violation: string
}

//
//
export class EntityValidator  {

  private validator!:Validator;
  get context() { return this.entity.context }


  constructor( public readonly entity:Entity ){
    this.validator = entity.context.validator( entity );
  }

  /**
   *
   */
  async validate( attributes:any ):Promise<ValidationViolation[]> {
    const action = _.has( attributes, 'id') ? 'update' : 'create';
    const validatable = await this.completeAttributes( attributes );
    const violations:ValidationViolation[] = [];
    violations.push( ... await this.validateRequiredAssocTos( validatable ) );
    violations.push( ... await this.validateUniqe( validatable ) );
    violations.push( ... await this.validator.validate( validatable, action ) );
    return violations;
  }

  /**
   * Retrieves the attributes from the ResolverContext, if an item exist (to be updated) the
   * current values are loaded and used when no values where provided
   * TODO what happens, when the user wants to delete a string value?
   * @returns map with attributes
   */
  private async completeAttributes( attributes:any ):Promise<any> {
    const id = _.get( attributes, 'id' );
    if( ! id ) return attributes;
    const current = await this.entity.findById( id );
    return _.defaultsDeep( _.cloneDeep(attributes), current.item );
  }

  /**
   *
   */
  private async validateRequiredAssocTos( attributes:any ):Promise<ValidationViolation[]> {
    const violations:ValidationViolation[] = [];
    for( const assocTo of this.entity.assocTo ){
      if( ! assocTo.required ) continue;
      const violation = await this.validateRequiredAssocTo( assocTo, attributes );
      if( violation ) violations.push( violation );
    }
    return violations;
  }

  /**
   *
   */
  private async validateRequiredAssocTo( assocTo:EntityReference, attributes:any ):Promise<ValidationViolation|undefined> {
    const refEntity = this.context.entities[assocTo.type];
    const foreignKey = _.get( attributes, refEntity.foreignKey );
    if( ! foreignKey ) return {attribute: refEntity.foreignKey, violation: "must be provided"};
    try {
      await refEntity.findById( _.toString(foreignKey) );
    } catch (error) {
      if( error instanceof NotFoundError ) return { attribute: refEntity.foreignKey, violation: "must refer to existing item" };
      return { attribute: refEntity.foreignKey, violation: _.toString(error) };
    }
  }

  /**
   *
   */
  private async validateUniqe( attributes:any ):Promise<ValidationViolation[]> {
    const violations:ValidationViolation[] = [];
    for( const name of _.keys(this.entity.attributes) ){
      const attribute = this.entity.attributes[name];
      if( ! attribute.unique ) continue;
      const violation = await this.validateUniqeAttribute( name, attribute, attributes );
      if( violation ) violations.push( violation );
    }
    return violations;
  }

  /**
   *
   */
  private async validateUniqeAttribute( name:string, attribute:TypeAttribute, attributes:any ):Promise<ValidationViolation|undefined> {
    const value = _.get( attributes, name );
    if( _.isUndefined( value ) ) return;
    const attrValues = _.set({}, name, value );
    let scopeMsg = "";
    if( _.isString( attribute.unique ) ){
      const scopeEntity = this.context.entities[attribute.unique];
      const scope = scopeEntity ? scopeEntity.foreignKey : attribute.unique;
      const scopeValue = _.get( attributes, scope );
      _.set(attrValues, scope, scopeValue );
      scopeMsg = ` within scope '${attribute.unique}'`;
    }
    const result = await this.entity.findByAttribute( attrValues );
    const violation = {attribute: name, violation: `value '${value}' must be unique` + scopeMsg }
    return this.isUniqueResult( attributes, result ) ? undefined : violation;
  }

  /**
   *
   */
  isUniqueResult( attributes:any, result:any[] ):boolean {
    if( _.size( result ) === 0 ) return true;
    if( _.size( result ) > 1 ) return false;
    const currentId = _.toString( _.get( attributes, "id" ) );
    return currentId === _.toString( _.get( _.first(result), 'id') );
  }


}
