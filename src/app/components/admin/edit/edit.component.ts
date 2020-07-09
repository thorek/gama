import { Component } from '@angular/core';
import * as inflection from 'inflection';
import * as _ from 'lodash';
import { FieldConfigType, AssocType } from 'src/app/lib/admin-config';

import { Validators, FormGroup } from '@angular/forms';
import { AdminEntityComponent } from '../admin-entity.component';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent extends AdminEntityComponent {

  validateForm!:FormGroup
  get fields() { return this.data.entityConfig.form.fields as FieldConfigType[] }

  submitForm():void {
    _.forEach( this.validateForm.controls, control => {
      control.markAsDirty();
      control.updateValueAndValidity();

    });
    if( this.validateForm.valid ) this.updateMutation();
  }

  errorTip(field:FieldConfigType):string {
    return 'Invalid';
  }

  onSave = () => this.submitForm();
  onCancel = () => this.onShow();

  protected prepareFields(){
    const config = this.data.entityConfig;
    if( ! _.has( config, 'form' ) ) _.set( config, 'form', {} );
    if( ! _.has( config.form, 'fields' ) ) _.set( config.form, 'fields',
      _.concat( _.keys( config.assocs ) , _.keys( config.fields ) ) );
    config.form.fields = _.compact( _.map( config.form.fields, (field:FieldConfigType) => this.prepareField( field ) ) );
  }

  protected prepareField( field:FieldConfigType ):FieldConfigType | undefined {
    const fieldConfig = this.data.entityConfig.fields[field.name];
    if( fieldConfig ) return this.fieldFromMetaField( field, fieldConfig );

    const assocConfig = this.data.entityConfig.assocs[field.path];
    if( assocConfig ) return this.fieldFromMetaAssoc( field, assocConfig );

    return this.warn( `neither field nor assoc : '${field}'`, undefined );
  }

  protected fieldFromMetaField( field:string|FieldConfigType, fieldConfig:FieldConfigType ):FieldConfigType {
    if( _.isString( field ) ) field = { name: field };
    return _.defaults( field, fieldConfig );
  }

  protected fieldFromMetaAssoc( field:string|FieldConfigType, assocConfig:AssocType ):FieldConfigType {
    if( _.isString( field ) ) field = { path: field };
    const config = this.adminService.getEntityConfig( assocConfig.path );
    if( ! config ) return this.warn( `no such config '${assocConfig.path}'`, undefined );
    const values = (data:any) => _.map( _.get( data, config.typesQuery ), data => ({
      value: _.get( data, 'id'), label: this.label( data )
    }));
    const query = _.get( this.data.entityConfig.assocs, [field.path, 'query']);
    const value = (item:any) => _.get( item, [query, 'id'] );
    const label = inflection.humanize( query );
    const control = 'select';
    return _.defaults( field,
      { name: config.foreignKey, path: assocConfig.path, required: assocConfig.required, values, value, label, control } );
  }

  protected buildForm(){
    this.prepareFields();
    const definition = _.reduce( this.fields, (definition, field) => {
      const validators = field.required ? [Validators.required] : [];
      const value = this.value( field );
      return _.set(definition, field.name, [value, validators]);
    }, {} );
    this.validateForm = this.fb.group(definition);
  }

  protected getItemInput = () => this.validateForm.value;



  /**
   *
   */
  protected updateMutation( id?:string, item?:any ){
    // if( ! id ) id = this.id;
    // if( ! item ) item = this.item;
    // const updateMutation =
    //   gql`mutation($input: ${this.config.updateInput}) {
    //     ${this.config.updateMutation}(${this.config.typeQuery}: $input ){
    //       validationViolations{
    //         attribute
    //         violation
    //       }
    //     }
    //   }`;
    // this.apollo.mutate({
    //   mutation: updateMutation,
    //   variables: { input: this.getItemInput( this.item ) },
    //   errorPolicy: 'all'
    // }).subscribe(({data}) => {
    //   const violations = _.get( data, 'validationViolations' );
    //   if( _.size( violations ) === 0 ) {
    //     this.message.info(`This ${this.title('edit')} was updated!` );
    //     setTimeout( ()=> this.onShow(), 500 );
    //   } else {
    //     this.message.error( _.join(violations, '\n') );
    //   }
    // });
  }
x

}
