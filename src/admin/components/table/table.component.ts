import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { AdminComponent } from 'src/admin/components/admin.component';
import { AdminTableConfig, FieldConfigType, UiConfigType } from 'src/admin/lib/admin-config';

@Component({
  selector: 'admin-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent extends AdminComponent {

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  @Input() parent:string|undefined
  @Output() selectItem = new EventEmitter<any>();
  @Output() actionItem = new EventEmitter<{id:any, action:string}>();
  @Input() config:AdminTableConfig|UiConfigType;
  @Input() set items( items:any[]){ this.setDataSource( items ) }

  dataSource:MatTableDataSource<any> = null;
  searchTerm:string;
  private searchEntered:Subject<string> = new Subject<string>();

  private setDataSource( items:any ){
    if( ! items ) return;
    this.dataSource = new MatTableDataSource(items);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item, property) => this.fieldConfig( property ).value( item );
  }

  get columns() { return _.map( this.fields, field => field.name ) }
  get fields():FieldConfigType[] { return _.filter( this.config.fields, field => this.showField( field ) ) as FieldConfigType[] }
  get search() { return this.config.search }

  get defaultActions() { return this.config.defaultActions || ['show', 'edit', 'delete'] }
  get actions() { return _.map(this.config.actions, (action, name) => _.set( action, 'name', name ) ) }

  onSearch = ($event:any) => this.searchEntered.next($event);
  onSelect = (id:any) => this.selectItem.emit( id );
  onEdit = (id:any) => this.actionItem.emit({ id, action: 'edit'} );
  onDelete = (id:any) => this.actionItem.emit({ id, action: 'delete'} );

  // private doSearch(){
  //   this.filtered = _.size(this.searchTerm) > 0;
  //   if( this.filtered ) this.filteredIds =
  //     _.map( this.miniSearch.search(this.searchTerm), item => item.id );
  // }

  // cancelSearch(){
  //   this.searchTerm = undefined;
  //   this.doSearch();
  // }

  private fieldConfig( property:string ):FieldConfigType {
    return _.find( this.config.fields, (field:FieldConfigType) => field.name === property ) as FieldConfigType;
  }

  private showField( field:FieldConfigType|string ):boolean {
    if( _.get( field, 'path' ) === this.parent ) return false;
    if( _.has( field, 'parent' ) && _.get( field, 'parent' ) === this.parent) return false;
    return true;
  }

}
