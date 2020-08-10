import * as _ from 'lodash';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FieldConfigType } from '../lib/admin-config';
import { AdminComponent } from './admin.component';

@Component({
  selector: 'admin-file-upload',
  template: `
    <div class="admin-file-upload">
      <mat-label> {{ label( field, item ) }} </mat-label>
      <div *ngIf="item" [innerHTML]="render( field, item ) | safe: 'html'"></div>
      <input type="file" (change)="onFileChange($event)" />
    </div>
  `,
  styles: [`
    .admin-file-upload { margin-top: 60px; }
  `]
})
export class FileUploadComponent extends AdminComponent {

  @Input() item:any;
  @Input() field:FieldConfigType;
  @Output() onLoad = new EventEmitter<any>();

  onFileChange(event:any) {
    if( _.size( _.get( event, 'target.files' ) ) === 0 ) return;
    this.item = undefined;
    const reader = new FileReader()
    const [file] = event.target.files;
    reader.readAsDataURL(file);
    reader.onload = () => this.onLoad.emit( {field: this.field, result: reader.result } );
  }
}
