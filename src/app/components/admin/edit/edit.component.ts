import { Component } from '@angular/core';

import * as _ from 'lodash';
import { FieldConfigType, AssocType, ViolationType } from 'src/app/lib/admin-config';

import { Validators, FormGroup } from '@angular/forms';
import { AdminEntityComponent } from '../admin-entity.component';


@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent extends AdminEntityComponent {

  violations:ViolationType[]
  validateForm!:FormGroup
  get fields() { return this.data.entityConfig.form.fields as FieldConfigType[] }

  async submitForm():Promise<void> {
    _.forEach( this.validateForm.controls, control => {
      control.markAsDirty();
      control.updateValueAndValidity();
    });
    if( this.validateForm.valid ) this.update();
  }

  protected async update(){
    const violations = await this.adminService.update( this.data.id, this.validateForm.value, this.data.entityConfig );
    _.size( violations ) === 0 ? this.onUpdateSuccess() : this.onUpdateViolations( violations );
  }

  protected onUpdateSuccess(){
    this.message.info(`This ${this.title('edit')} was successfully updated!` );
    setTimeout( ()=> this.onShow(), 200 );
  }

  protected onUpdateViolations( violations:ViolationType[] ){
    this.violations = violations;
    _.forEach( violations, violation => {
      const control = this.validateForm.controls[violation.attribute];
      if( control ) control.setErrors( { invalid: true } );
    });
  }

  errorTip(field:FieldConfigType):string {
    const control = this.validateForm.controls[field.name];
    if( control && control.hasError('invalid') ) return _(this.violations).
      filter( violation => violation.attribute === field.name ).
      map( violation => violation.message ).
      join(', ');
  }

  onSave = () => this.submitForm();
  onCancel = () => this.onShow();

  protected buildForm(){
    const definition = _.reduce( this.fields, (definition, field) => {
      const validators = field.required ? [Validators.required] : [];
      const value = field.path ? field.keyValue( this.data.item ) : this.value( field );
      return _.set(definition, field.name, [value, validators]);
    }, {} );
    this.validateForm = this.fb.group(definition);
  }

}
