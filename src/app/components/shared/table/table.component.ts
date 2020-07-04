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
  filterList?:NzTableFilterList;
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
  private filteredIds:any[] = [];
  private searchEntered:Subject<string> = new Subject<string>();
  private miniSearch:MiniSearch;
  columns:ColumnItem[] = []
  onSearch = ($event:any) => this.searchEntered.next($event);

  get search() { return this.config.search }
  get items() { return this.filtered ?
      _.filter( this.sourceItems, item => _.includes( this.filteredIds, item.id ) ) :
      this.sourceItems
  }
  get fields() { return this.config.fields as FieldConfigType[]}
  get actions() { return this.config.actions }

  onSelect = (id:any) => this.selectItem.emit( id );
  onDelete = (id:any) => this.actionItem.emit({ id, action: 'delete'} );

  private resolveItems( items:any[] ){
    this.sourceItems = _.cloneDeep( items );
    _.forEach( this.sourceItems, item => {
      _.set( item, 'source', _.cloneDeep(item) );
      _.forEach( this.fields, field =>
        _.set( item, field.name, this.value( item, field ) ) );
    });
  }

  private prepareSearch(){
    this.searchTerm = undefined;
    const fields = _.compact( _.map( this.fields, field =>
      field.searchable === false ? undefined : field.name ));
    this.miniSearch = new MiniSearch({
      fields,  storeFields: ['id'], searchOptions: {  prefix: true, fuzzy: 0.05 }
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
      sortFn: (a:any, b:any) => this.sortFn( a, b, field.name ),
      filterList: this.filterList( this.sourceItems, field ),
      filterMultiple: _.get( field.filter, 'multiple'),
      filterFn: (selection: string|string[], item:any) => {
        let value = this.getValueOrGuessNameValue( field, item.source );
        if( _.isUndefined( value ) ) return false;
        if( ! _.isArray( selection) ) selection = [selection];
        if( ! _.isArray( value ) ) value = [value];
        return _.size(_.intersection( selection, value )) > 0;
      }
    }));
  }

  private doSearch(){
    this.filtered = _.size(this.searchTerm) > 0;
    if( this.filtered ) this.filteredIds =
      _.map( this.miniSearch.search(this.searchTerm), item => item.id );
  }

  cancelSearch(){
    this.searchTerm = undefined;
    this.doSearch();
  }

  private sortFn = (a:any, b:any, property:string) => {
    const aValue = _.get( a, property );
    const bValue = _.get( b, property );
    if( aValue == null && bValue == null ) return 0;
    if( aValue == null || bValue == null ) return aValue == null ? 1 : -1;
    return aValue.localeCompare(bValue);
  }

  private filterList = (items:any, field:FieldConfigType) => {
    if( ! field.filter ) return undefined;
    return _(items).
      map( item => this.getValueOrGuessNameValue( field, item.source ) ).
      flatten().
      compact().
      uniq().
      map( value => ({ text:value, value})).
      value();
  }

  private getValueOrGuessNameValue( field:FieldConfigType, item:any ):undefined|string|string[]{
    if( ! field.filter ) return;
    if( field.filter === true ) field.filter = {}
    const valueFn = _.isFunction(field.filter.value) ?
      field.filter.value : _.isFunction( field.value ) ?
        field.value : (item:any) => _.get( item, field.name )
    let value = valueFn( item );
    if( _.isArray( value ) ) return _.map( value, v => _.isString( v ) ? v : this.guessNameValue( v ) );
    return _.isString( value ) ? value : this.guessNameValue( value );
  }
}
