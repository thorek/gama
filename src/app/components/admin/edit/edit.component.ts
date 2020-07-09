import { Component } from '@angular/core';
import * as inflection from 'inflection';
import * as _ from 'lodash';
import { FieldConfigType, FormFieldConfigType, FieldMetaDataType, AssocType } from 'src/app/lib/admin-config';

import { Validators, FormGroup } from '@angular/forms';
import { AdminEntityComponent } from '../admin-entity.component';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent extends AdminEntityComponent {

  validateForm!:FormGroup
  get fields() { return this.data.entityConfig.form.fields as FormFieldConfigType[] }

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
  onCancel = () => this.onList();


  protected prepareFields(){
    const config = this.data.entityConfig;
    if( ! _.has( config, 'form' ) ) _.set( config, 'form', {} );
    if( ! _.has( config.form, 'fields' ) ) _.set( config.form, 'fields',
      _.concat( _.keys( config.assoc ) , _.keys( config.fields ) ) );

    config.form.fields = _.compact( _.map( config.form.fields, field => this.prepareField( field ) ) );
  }

  protected prepareField( field:string|FormFieldConfigType ):FormFieldConfigType | undefined {
    const fieldName = _.isString( field ) ? field : field.name;
    const fieldConfig = this.data.entityConfig.fields[fieldName];
    if( fieldConfig ) return this.fieldFromMetaField( field, fieldConfig );

    const path = _.isString( field ) ? field : field.path;
    const assocConfig = this.data.entityConfig.assoc[path];
    if( assocConfig ) return this.fieldFromMetaAssoc( field, assocConfig );

    return this.warn( `neither field nor assoc : '${field}'`, undefined );
  }

  protected fieldFromMetaField( field:string|FormFieldConfigType, fieldConfig:FieldMetaDataType ):FormFieldConfigType {
    if( _.isString( field ) ) field = { name: field };
    return _.defaults( field, _.pick( fieldConfig, ['name', 'required', 'virtual'] ));
  }

  protected fieldFromMetaAssoc( field:string|FormFieldConfigType, assocConfig:AssocType ):FormFieldConfigType {
    if( _.isString( field ) ) field = { path: field };
    const config = this.adminService.getEntityConfig( assocConfig.path );
    if( ! config ) return this.warn( `no such config '${assocConfig.path}'`, undefined );
    const values = (data:any) => _.get( data, config.typesQuery );
    const label = inflection.humanize( inflection.singularize( field.path ) );
    const control = 'select';
    return _.defaults( field,
      { name: config.foreignKey, path: assocConfig.path, required: assocConfig.required, values, label, control } );
  }

  protected buildForm(){
    this.prepareFields();
    const definition = {};

    _.reduce( this.fields, (definition, field) => {
      if( _.isString( field ) ) field = { name: field } as FieldConfigType;
      if( _.has( field, 'path') ) {
        const path = _.get( field, 'path' );
        const config = this.adminService.getEntityConfig( path );
        if( ! config ) return this.warn( `no such config '${path}'`, definition );
        _.set( field, 'name', config.foreignKey );
      }
      const fieldName = _.get( field, 'name' );
      const fieldMeta =  this.data.entityConfig.fields[fieldName];
      const required = _.get( fieldMeta, 'required' );
      const validators = required ? [Validators.required] : [];
      return _.set(definition, fieldName, [null, validators]);
    }, definition );

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
