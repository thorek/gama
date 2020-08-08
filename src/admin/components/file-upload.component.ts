import * as _ from 'lodash';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FieldConfigType } from '../lib/admin-config';

@Component({
  selector: 'admin-file-upload',
  template: `<input type="file" (change)="onFileChange($event)" />  `
})
export class FileUploadComponent {

  @Input() field:FieldConfigType;
  @Output() onLoad = new EventEmitter<any>();

  onFileChange(event:any) {
    if( _.size( _.get( event, 'target.files' ) ) === 0 ) return;
    const reader = new FileReader()
    const [file] = event.target.files;
    reader.readAsDataURL(file);
    reader.onload = () => this.onLoad.emit( {field: this.field, result: reader.result } );
  }
}
