import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as _ from 'lodash';
import MiniSearch from 'minisearch';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AdminComponent } from 'src/admin/components/admin.component';
import { AdminConfig, AdminTableConfig, FieldConfigType, UiConfigType } from 'src/admin/lib/admin-config';
import { AdminService } from 'src/admin/services/admin.service';

interface ColumnItem {
  name:string;
  field:FieldConfigType;
  label:string;
  sortOrder?:any;
  sortFn?:any;
  filterList?:any;
  filterFn?:any;
  filterMultiple?:boolean;
  sortDirections?:any[];
}

export type TableFieldType = string|{name:string, label?:string, value?:(entity:any) => any }

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent extends AdminComponent {

  @Input() parent:string|undefined
  @Input() config:AdminTableConfig|UiConfigType;
  @Output() selectItem = new EventEmitter<any>();
  @Output() actionItem = new EventEmitter<{id:any, action:string}>();
  @Input() set items( items:any[]){
    if( ! items ) return;
    this.resolveItems( items );
    this.prepareColumns();
    this.prepareSearch();
  }

  constructor( private adminService:AdminService ){ super() }

  searchTerm:string;
  private filtered = false;
  private resolvedItems:any[] = [];
  private filteredIds:any[] = [];
  private searchEntered:Subject<string> = new Subject<string>();
  private miniSearch:MiniSearch;
  columns:ColumnItem[] = []
  onSearch = ($event:any) => this.searchEntered.next($event);

  get search() { return this.config.search }
  get items() { return this.filtered ?
      _.filter( this.resolvedItems, item => _.includes( this.filteredIds, item.id ) ) :
      this.resolvedItems
  }

  get defaultActions() { return this.config.defaultActions || ['show', 'edit', 'delete'] }
  get actions() { return _.map(this.config.actions, (action, name) => _.set( action, 'name', name ) ) }

  onSelect = (id:any) => this.selectItem.emit( id );
  onEdit = (id:any) => this.actionItem.emit({ id, action: 'edit'} );
  onDelete = (id:any) => this.actionItem.emit({ id, action: 'delete'} );

  private resolveItems( items:any[] ){
    this.resolvedItems = _.cloneDeep( items );
    _.forEach( this.resolvedItems, item => {
      _.set( item, 'source', _.cloneDeep(item) );
      _.forEach( this.config.fields, (field:FieldConfigType) =>
        _.set( item, field.name, this.value( field, item ) ) );
    });
  }

  private prepareSearch(){
    this.searchTerm = undefined;
    const fields = _.compact( _.map( this.columns, column =>
      column.field.searchable === false ? undefined : column.name ));
    this.miniSearch = new MiniSearch({
      fields,  storeFields: ['id'], searchOptions: {  prefix: true, fuzzy: 0.05 }
    });
    this.miniSearch.addAll( this.resolvedItems );
    this.searchEntered.pipe(
      debounceTime(400), distinctUntilChanged()
    ).subscribe( () => this.doSearch() );
  }

  private prepareColumns(){
    this.columns = _.compact( _.map( this.config.fields, (field:FieldConfigType) => {
      if( _.get( field, 'path' ) === this.parent ) return;
      if( _.has( field, 'parent' ) && field.parent === this.parent) return;
      return { field, name: field.name, label: this.label(field), sortOrder: null,
        sortFn: (a:any, b:any) => this.sortFn( a, b, field.name ),
        filterList: this.filterList( this.resolvedItems, field ),
        filterMultiple: _.get( field.filter, 'multiple'),
        filterFn: (selection:string|string[], item:any) => this.filterFn( field, selection, item )
      };
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

  private filterFn = (field:FieldConfigType, selection:string|string[], item:any) => {
    let value = this.getValueOrGuessNameValue( field, item.source );
    if( _.isUndefined( value ) ) return false;
    if( ! _.isArray( selection) ) selection = [selection];
    if( ! _.isArray( value ) ) value = [value];
    return _.size(_.intersection( selection, value )) > 0;
  };

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

    if( _.isArray( value ) ) return _.map( value, v => _.isString( v ) ? v : this.guessNameValue( field, v ) );
    return _.isString( value ) ? value : this.guessNameValue( field, value );
  }

  private guessNameValue( field:FieldConfigType, item:any ):string {
    if( _.has( item, 'value' ) ) return item.value;
    const nameFn = field.path ?
      _.get( this.adminService.getEntityConfig( field.path ), 'name' ) : AdminConfig.guessNameValue;
    const value = nameFn( item );
    return _.isString( value ) ? value : _.toString( value );
  }
}
