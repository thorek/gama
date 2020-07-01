import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AdminTableConfig, UiConfigType } from 'src/app/services/admin.service';

import { AdminComponent } from '../../admin/admin.component';

export type TableFieldType = string|{name:string, label?:string, value?:(entity:any) => any }

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent extends AdminComponent {

  @Input() config:AdminTableConfig|UiConfigType;
  @Input() items:any[];
  @Output() selectItem = new EventEmitter<any>();
  @Output() actionItem = new EventEmitter<{id:any, action:string}>();

  get fields() { return this.config.fields }
  get actions() { return this.config.actions }

  onSelect = (id:any) => this.selectItem.emit( id );
  onDelete = (id:any) => this.actionItem.emit({ id, action: 'delete'} );
}
