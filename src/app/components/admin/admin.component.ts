import * as inflection from 'inflection';
import * as _ from 'lodash';
import { FieldConfigType } from 'src/app/services/admin.service';

export abstract class AdminComponent {


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
