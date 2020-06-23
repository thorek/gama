import _ from 'lodash';
import validate from 'validate.js';

import { Entity } from '../entities/entity';
import { Validator } from './validator';
import { ValidationViolation } from '../entities/entity-validator';

/**
 *
 */
export class ValidateJs extends Validator {

  private constraints:any = {};

  /**
   *
   */
  constructor( protected readonly entity:Entity ){
    super( entity );
    this.buildConstraints();
  }

  /**
   *
   */
  async validate( attributes:any ): Promise<ValidationViolation[]> {
    const result = validate( attributes, this.constraints );
    return result === true ? [] : this.formatErrors( result );
  }

  /**
   *
   */
  private formatErrors( result:any ):ValidationViolation[] {
    const errors:ValidationViolation[] = [];
    _.forEach( result, (messages:string[], attribute) => {
      _.forEach( messages, violation => errors.push( { attribute, violation } ) );
    });
    return errors;
  }

  /**
   *
   */
  private buildConstraints() {
    this.constraints = {};
    _.forEach( this.entity.attributes, (attribute, name:string) => {
      let validation = attribute.validation;
      if( attribute.required ) validation = _.set( validation || {}, 'presence', true );
      if( validation ) this.constraints[name] = validation
    });
  }

}
