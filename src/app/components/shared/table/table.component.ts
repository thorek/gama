import * as _ from 'lodash';
import { Component, Input, Output, EventEmitter } from '@angular/core';

export type TableFieldType = string|{name:string, label?:string, value?:(entity:any) => any }

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent {

  @Input() fields:TableFieldType[];
  @Input() entities:any[];
  @Output() selectEntity = new EventEmitter<any>();
  @Output() action = new EventEmitter<{id:any, action:string}>();


  label(field:TableFieldType){ return _.isString( field ) ? field : field.label || field.name }
  value(entity:any, field:string|TableFieldType){
    if( _.isString(field) ) return _.get(entity, field);
    return _.isFunction( field.value ) ? field.value( entity ) : _.get( entity, field.name );
  }

  onSelect(id:any) { this.selectEntity.emit(id) }
  onDelete(id:any) { this.action.emit({ id, action: 'delete'} ) }
}
