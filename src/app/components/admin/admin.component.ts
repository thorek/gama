import * as inflection from 'inflection';
import * as _ from 'lodash';
import { FieldConfigType } from 'src/app/services/admin.service';

export abstract class AdminComponent {

  sortFn = (a:any, b:any, property:string) => {
    const aValue = _.get( a, property );
    const bValue = _.get( b, property );
    if( aValue == null && bValue == null ) return 0;
    if( aValue == null || bValue == null ) return aValue == null ? 1 : -1;
    return aValue.localeCompare(bValue);
  }

  label( field:FieldConfigType ):string {
    if( _.isFunction( field.label ) ) return field.label();
    // if there is i18n - return label lookup of label | name
    if( _.isString( field.label ) ) return field.label;
    if( _.isString( field.name ) ) return inflection.humanize( field.name );
    return _.toString(field);
  }

  value(item:any, field:FieldConfigType){
    return _.isFunction( field.value ) ? field.value( item ) : _.get( item, field.name );
  }

  isLink( field:FieldConfigType ):boolean {
    return _.isFunction( field.link );
  }

  link( item:any, field:FieldConfigType ):string[] {
    return field.link( item );
  }

  protected warn<T>( message:string, type:T ):T {
    console.warn(message);
    return type;
  }

}
