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
    if( ! _.isFunction( field.value ) ) return _.get( item, field.name );
    const value = field.value( item );
    return _.isArray( value ) ?
      _(value).map( v => v['name'] ).join(', ') :
      value;
  }

  isLink( field:FieldConfigType ):boolean {
    return _.isFunction( field.link );
  }

  link( item:any, field:FieldConfigType ):string[] {
    return field.link( item );
  }

  protected guessNameValue( item:any ):string {
    const property = _.find(['name', 'title', 'key'], property => _.has( item, property ) );
    if( property ) return _.get( item, property );
    if( _.has( item, 'id' ) ) return `#${_.get(item, 'id' ) }`;
    return _.toString( item );
  }

  protected warn<T>( message:string, type:T ):T {
    console.warn(message);
    return type;
  }

}
