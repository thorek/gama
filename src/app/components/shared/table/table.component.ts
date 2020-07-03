import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as _ from 'lodash';
import MiniSearch from 'minisearch';
import { NzTableFilterFn, NzTableFilterList, NzTableSortFn, NzTableSortOrder } from 'ng-zorro-antd/table';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AdminTableConfig, FieldConfigType, UiConfigType } from 'src/app/services/admin.service';

import { AdminComponent } from '../../admin/admin.component';

interface ColumnItem {
  name:string;
  label:string;
  sortOrder?:NzTableSortOrder;
  sortFn?:NzTableSortFn;
  listOfFilter?:NzTableFilterList;
  filterFn?:NzTableFilterFn;
  filterMultiple?:boolean;
  sortDirections?:NzTableSortOrder[];
}

export type TableFieldType = string|{name:string, label?:string, value?:(entity:any) => any }

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent extends AdminComponent {

  @Input() config:AdminTableConfig|UiConfigType;
  @Output() selectItem = new EventEmitter<any>();
  @Output() actionItem = new EventEmitter<{id:any, action:string}>();
  @Input() set items( items:any[]){
    if( ! items ) return;
    this.resolveItems( items );
    this.prepareColumns();
    this.prepareSearch();
  }

  searchTerm:string;
  private filtered = false;
  private sourceItems:any[] = [];
  private filteredItems:any[] = [];
  private searchEntered:Subject<string> = new Subject<string>();
  private miniSearch:MiniSearch;
  columns:ColumnItem[] = []
  onSearch = ($event:any) => this.searchEntered.next($event);

  get items() { return this.filtered ? this.filteredItems : this.sourceItems }
  get fields() { return this.config.fields as FieldConfigType[]}
  get actions() { return this.config.actions }

  onSelect = (id:any) => this.selectItem.emit( id );
  onDelete = (id:any) => this.actionItem.emit({ id, action: 'delete'} );

  private resolveItems( items:any[] ){
    _.forEach( items, item => _.forEach( this.fields, field =>
      _.set( item, field.name, this.value( item, field ) ) ) );
    this.sourceItems = items;
  }

  private prepareSearch(){
    this.searchTerm = undefined;
    const fields = _.compact( _.map( this.fields, field =>
      field.searchable === false ? undefined : field.name ));
    this.miniSearch = new MiniSearch({
      fields,  storeFields: fields, searchOptions: {  prefix: true, fuzzy: 0.05 }
    });
    this.miniSearch.addAll( this.sourceItems );
    this.searchEntered.pipe(
      debounceTime(400), distinctUntilChanged()
    ).subscribe( () => this.doSearch() );
  }

  private prepareColumns(){
    this.columns = _.map( this.fields, field => ({
      name: field.name,
      label: this.label(field),
      sortOrder: null,
      sortFn: (a:any, b:any) => this.sortFn( a, b, field.name )
    }));
  }

  private doSearch(){
    this.filtered = _.size(this.searchTerm) > 0;
    if( this.filtered ) this.filteredItems = this.miniSearch.search(this.searchTerm);
  }

  cancelSearch(){
    this.searchTerm = undefined;
    this.doSearch();
  }
}
