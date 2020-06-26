import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import * as inflection from 'inflection';
import * as _ from 'lodash';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AdminService, EntityConfigType, ColumnConfigType } from 'src/app/services/admin.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {

  path:string;
  items:any;
  loading = true;
  config:EntityConfigType;
  error:any;

  get columns() { return this.config.index.columns }
  get entitiesName() { return this.config.entitesName || inflection.humanize( this.path ) }
  get entityName() { return this.config.entityName || inflection.humanize( inflection.singularize(this.path ) ) }

  constructor(
    private adminService:AdminService,
    private apollo:Apollo,
    private route:ActivatedRoute,
    private router:Router,
    private modal:NzModalService ) {}


  ngOnInit() {
    this.route.params.subscribe( params => this.loadData( params['path']) );
  }

  /**
   *
   */
  private async loadData( path:string ){
    this.path = path;
    const config = this.adminService.getEntityConfig(path);
    this.config = this.setDefaults( config );

    const query = gql`query{ ${ this.buildFieldQuery() } }`;
    console.log({query})

    this.apollo.watchQuery<any>({
      query, variables: { path }})
      .valueChanges
      .subscribe(({ data, loading }) => {
        console.log({data, loading})
        this.loading = loading;
        this.items = _.get( data, this.config.typesQuery );
      }, error => this.error = error );
  }

  private buildFieldQuery():string {
    const columnFields = _(this.config.index.columns).
      filter( (col:ColumnConfigType) => _.includes( _.keys(this.config.fields ), col.name ) ).
      map( (col:ColumnConfigType) => col.name ).
      value();
    const assocFields = _.map( this.config.index.assoc, (assoc, name) => `${name} { ${ _.join(assoc, ' ') } }` );
    return `${this.config.typesQuery} { ${ _.join( _.concat( columnFields, assocFields ), ' ' ) } }`;
  }

  private setDefaults( config:EntityConfigType ):EntityConfigType {
    if( ! _.has(config, 'index') ) _.set( config, 'index', {} );
    if( ! _.has(config, 'index.columns') ) _.set( config, 'index.columns', _.keys( config.fields ) );
    config.index.columns = _.map( config.index.columns, col => _.isString( col ) ? { name: col } : col );
    return config;
  }

  label( col:ColumnConfigType ):string {
    if( _.isFunction( col.label ) ) return col.label();
    // if there is i18n - return label lookup of label | name
    if( _.isString( col.label ) ) return col.label;
    return inflection.humanize( col.name );
  }

  value(item:any, column:ColumnConfigType){
    return _.isFunction( column.value ) ? column.value( item ) : _.get( item, column.name );
  }

  onNew() { console.log('new ', this.path ) }
  onSelect(id:any) { this.router.navigate(['admin', this.path, id]) }
  onDelete(id:string) {
    this.modal.confirm({
      nzTitle: 'Are you sure delete this item?',
      nzContent: '<b style="color: red;">All related entities will be deleted too!</b>',
      nzOkText: 'Yes',
      nzOkType: 'danger',
      nzOnOk: () => console.log('OK'),
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel')
    });
  }

}
