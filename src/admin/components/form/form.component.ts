import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';

import { Subject } from 'rxjs';
import { FieldConfigType, ViolationType } from 'src/admin/lib/admin-config';
import { AdminData } from 'src/admin/lib/admin-data';
import { AdminService } from 'src/admin/services/admin.service';

import { AdminComponent } from 'src/admin/components/admin.component';

@Component({
  selector: 'admin-form',
  templateUrl: './form.component.html'
})
export class FormComponent extends AdminComponent implements OnInit {

  @Input() data:AdminData;
  @Input() submit:Subject<any>;
  @Output() saveSuccess = new EventEmitter<any>();

  violations:ViolationType[]
  validateForm!:FormGroup
  get fields() { return this.data.entityConfig.form.fields as FieldConfigType[] }

  constructor(
    private fb:FormBuilder,
    private adminService:AdminService )
  { super() }

  ngOnInit(){
    this.buildForm();
    this.submit.subscribe( () => this.submitForm() );
  }

  async submitForm():Promise<void> {
    _.forEach( this.validateForm.controls, control => {
      control.markAsDirty();
      control.updateValueAndValidity();
    });
    if( this.validateForm.valid ) this.save();
  }

  protected async save(){
    const saveResult = await this.adminService.save( this.data.id, this.validateForm.value, this.data.entityConfig );
    _.isUndefined( saveResult.id ) ?
      this.onSaveViolations( saveResult.violations ) :
      this.saveSuccess.emit( saveResult.id );
  }

  protected onSaveViolations( violations:ViolationType[] ){
    this.violations = violations;
    _.forEach( violations, violation => {
      const control = this.validateForm.controls[violation.attribute];
      if( control ) control.setErrors( { invalid: true } );
    });
  }

  errorTip(field:FieldConfigType):string {
    const control = this.validateForm.controls[field.name];
    if( ! control ) return undefined;
    if( control.hasError('required') ) return 'is required';
    if( control.hasError('invalid') ) return _(this.violations).
      filter( violation => violation.attribute === field.name ).
      map( violation => violation.message ).
      join(', ');
  }

  protected buildForm(){
    const definition = _.reduce( this.fields, (definition, field) => {
      const validators = field.required ? [Validators.required] : [];
      const value = field.path ? field.keyValue( this.data.item ) : this.value( field, this.data.item );
      return _.set(definition, field.name, [value, validators]);
    }, {} );
    this.validateForm = this.fb.group(definition);
  }

}