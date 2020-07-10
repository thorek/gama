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
    if( _.size( violations ) === 0 ) return this.onUpdateSuccess();
    this.onUpdateViolations( violations );
  }

  protected onUpdateSuccess(){
    this.message.info(`This ${this.title('edit')} was updated!` );
    setTimeout( ()=> this.onShow(), 500 );
  }

  protected onUpdateViolations( violations:ViolationType[] ){
    this.message.error( _.join( _.map(violations, violation =>
      `${violation.attribute}: ${violation.message}`), '\n') );
  }

  errorTip(field:FieldConfigType):string {
    return 'Invalid';
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
