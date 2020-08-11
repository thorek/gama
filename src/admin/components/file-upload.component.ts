import * as _ from 'lodash';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FieldConfigType } from '../lib/admin-config';
import { AdminComponent } from './admin.component';

@Component({
  selector: 'admin-file-upload',
  template: `
    <div class="admin-file-upload">
      <label> {{ label( field ) }} </label>
      <div *ngIf="item" [innerHTML]="render( field, item ) | safe: 'html'"></div>
      <input type="file" (change)="onFileChange($event)" />
    </div>
  `,
  styles: [`
    .admin-file-upload { margin-top: 20px; }
    label { color: rgba(0,0,0,.54) }
  `]
})
export class FileUploadComponent extends AdminComponent {

  @Input() item:any;
  @Input() field:FieldConfigType;
  @Output() onLoad = new EventEmitter<any>();

  onFileChange(event:any) {
    const file = _.get( event, 'target.files.[0]' )
    if( ! file ) return;
    this.item = undefined;
    this.onLoad.emit( {field: this.field, file: file } );
  }
}
