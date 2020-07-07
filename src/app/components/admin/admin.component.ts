import * as _ from 'lodash';
import * as inflection from 'inflection';
import { EntityConfigType, TitlePurposeType, FieldConfigType } from 'src/app/lib/admin-config';

export abstract class AdminComponent {

  protected guessNameValue( item:any ):string {
    const candidates = ['name', 'title', 'key'];
    const candidate = _.find( candidates, candidate => _.has( item, candidate ) );
    if( candidate ) return _.get( item, candidate );
    if( _.has( item, 'id' ) ) return `#${_.get(item, 'id' ) }`;
    return _.toString( item );
  }

  title( purpose:TitlePurposeType, config:EntityConfigType ):string {
    if( _.isFunction( config.title ) ) return config.title( purpose );
    if( _.isString( config.title ) ) return config.title;
    return _.includes(['show','edit'], purpose ) ?
      inflection.humanize( inflection.singularize( config.path ) ) :
      inflection.humanize( config.path );
  }

  name( item:any, config:EntityConfigType ){
    if( _.isFunction(config.name) ) return config.name( item );
    return this.guessNameValue( item );
  }

  label( field:FieldConfigType ):string {
    if( _.isFunction( field.label ) ) return field.label();
    // if there is i18n - return label lookup of label | name
    if( _.isString( field.label ) ) return field.label;
    if( _.isString( field.name ) ) return inflection.humanize( field.name );
    return _.toString(field);
  }

  required( field:FieldConfigType, config:EntityConfigType ):boolean {
    const meta = config.fields[field.name];
    return _.get( meta, 'required' );
  }

  value( field:FieldConfigType, item:any ){
    if( ! _.isFunction( field.value ) ) return _.get( item, field.name );
    const value = field.value( item );
    return _.isArray( value ) ?
      _(value).map( v => this.guessNameValue( v ) ).join(', ') :
      value;
  }

  isLink( field:FieldConfigType ):boolean {
    return _.isFunction( field.link );
  }

  link( field:FieldConfigType, item:any ):string[] {
    if( ! this.isLink( field ) ) return [];
    return field.link( item );
  }

}
