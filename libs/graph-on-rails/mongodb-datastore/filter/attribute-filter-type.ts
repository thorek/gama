import _ from 'lodash';

import { FilterType } from '../../builder/filter-type';

/**
 *
 */
export abstract class AttributeFilterType extends FilterType {

  async setFilterExpression( expression:any, condition:any, field:string ):Promise<void> {
    const e = this.getFilterExpression( condition, field );
    if( ! e ) return;
    _.set( expression, field, e );
  } 

  abstract getFilterExpression( condition:any, field:string ):any;
}
