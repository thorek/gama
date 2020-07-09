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


  protected buildForm(){
    const definition = _.reduce( this.fields, (definition, field) => {
      const validators = field.required ? [Validators.required] : [];
      const value = field.path ? this.rawValue( field ) : this.value( field );
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
