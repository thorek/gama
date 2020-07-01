import { Component } from '@angular/core';
import gql from 'graphql-tag';
import * as _ from 'lodash';
import { EntityConfigType, FieldConfigType } from 'src/app/services/admin.service';

import { AdminEntityComponent } from '../admin-entity.component';
import { FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent extends AdminEntityComponent {

  validateForm!:FormGroup
  get fields():FieldConfigType[] { return this.config.create.fields as FieldConfigType[] }

  getQuery(){ return undefined }

  setData( data:any ):void {
    this.item = data;
    this.buildForm();
  }

  submitForm():void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if( this.validateForm.valid ) this.createMutation();
  }

  errorTip(field:FieldConfigType):string {
    return 'Invalid';
  }

  onSave = () => this.submitForm();
  onCancel = () => this.router.navigate(['/admin', this.path ]);

  protected setDefaults( config:EntityConfigType ):EntityConfigType {
    if( ! _.has(config, 'create') ) _.set( config, 'create', {} );
    if( ! _.has( config.create, 'query' ) ) _.set( config.create, 'query', config.typeQuery );
    this.setFieldDefaults( config.create, this.path);
    return config;
  }

  /**
   *
   */
  protected createMutation(){
    const createMutation =
      gql`mutation($input: ${this.config.createInput}) {
        ${this.config.createMutation}(${this.config.typeQuery}: $input ){
          validationViolations{
            attribute
            violation
          }
          ${this.config.typeQuery}{ id }
        }
      }`;
    this.apollo.mutate({
      mutation: createMutation,
      variables: { input: this.getItemInput() },
      errorPolicy: 'all'
    }).subscribe(({data, errors}) => {
      const result = _.get( data, this.config.createMutation );
      const violations = _.get( result, 'validationViolations' );
      if( _.size(errors) > 0 ) console.error( {errors})
      if( _.size( violations ) === 0 ) {
        this.message.info(`This ${this.title('edit')} was created!` );
        const id = _.get( result, [this.config.typeQuery, 'id'] );
        setTimeout( ()=> this.gotoShow( this.path, id ), 500 );
      } else {
        this.message.error( _.join(violations, '\n') );
      }
    }, error => {
      this.message.error( 'Bad request; check error console.' );
      console.error({error})
    });
  }

  protected buildForm(){
    const definition = _.reduce( this.config.create.fields, (definition, field:FieldConfigType) => {
      const validators = this.required( field ) ? [Validators.required] : [];
      return _.set(definition, field.name, [null, validators]);
    }, {});
    this.validateForm = this.fb.group(definition);
  }

  protected getItemInput = () => this.validateForm.value;
}
