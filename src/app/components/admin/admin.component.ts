import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import * as inflection from 'inflection';
import * as _ from 'lodash';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AdminService, EntityConfigType, FieldConfigType, UiConfigType, AssocConfigType } from 'src/app/services/admin.service';

export abstract class AdminComponent implements OnInit {

  id?:string;
  path:string;
  loading = true;
  config:EntityConfigType;
  error:any;

  get entitiesName() { return _.get(this.config, 'entitesName' ) || inflection.humanize( this.path ) }
  get entityName() { return _.get(this.config, 'entityName' ) || inflection.humanize( inflection.singularize(this.path ) ) }

  get columns() { return this.config.index.fields } //?

  constructor(
    private adminService:AdminService,
    private apollo:Apollo,
    private route:ActivatedRoute,
    private router:Router,
    private modal:NzModalService ) {}


  ngOnInit() {
    this.route.params.subscribe( params => {
      this.id = params['id'];
      this.loadData( params['path'])
     });
  }

  protected abstract getQuery():{query:any, variables?:any};
  protected abstract setData( data:any ):void;
  protected abstract setDefaults( config:EntityConfigType ):EntityConfigType;

  /**
   *
   */
  private async loadData( path:string ){
    this.path = path;
    const config = this.adminService.getEntityConfig(path);
    this.config = this.setDefaults( config );

    this.apollo.watchQuery<any>( this.getQuery() )
      .valueChanges
      .subscribe(({ data, loading }) => {
        console.log({data, loading})
        this.loading = loading;
        this.setData( data );
      }, error => this.error = error );
  }


  label( field:FieldConfigType ):string {
    if( _.isFunction( field.label ) ) return field.label();
    // if there is i18n - return label lookup of label | name
    if( _.isString( field.label ) ) return field.label;
    return inflection.humanize( field.name );
  }

  value(item:any, field:FieldConfigType){
    return _.isFunction( field.value ) ? field.value( item ) : _.get( item, field.name );
  }

  isLink( field:FieldConfigType ):boolean {
    return _.isFunction( field.link );
  }

  link( item:any, field:FieldConfigType ):string[] {
    return field.link( item );
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

  protected buildFieldQuery( config:UiConfigType ):string {
    const queryFields = _(config.fields).
      filter( (field:FieldConfigType) => _.includes( _.keys(this.config.fields ), field.name ) ).
      map( (field:FieldConfigType) => field.name ).
      value();

    const assocFields = _.map( config.assoc, assoc =>
        this.getAssocFields( assoc, this.adminService.getEntityConfig(this.path))).join( ' ');

    return `{ id ${ _.join( _.concat( queryFields, assocFields ), ' ' ) } }`;
  }

  protected getAssocFields( assoc:AssocConfigType, rootConfig:EntityConfigType ):string|undefined {
    if( _.isString( assoc ) ) assoc = _.set( {}, 'path', assoc );
    const config = this.adminService.getEntityConfig( assoc.path );
    if( ! config ) return this.warn( `getAssocFields: no config for path '${assoc.path}' `, undefined);
    const query = _.get( rootConfig.assoc, [assoc.path, 'query']);
    if( ! query ) return this.warn( `getAssocFields: no query for path '${assoc.path}' `, undefined);
    if( ! assoc.fields ) assoc.fields = _.keys( config.fields );
    const fields = _.filter( assoc.fields, field => _.includes( _.keys( config.fields ), field ) );
    return _.concat(
      query, '{', fields, _.map( assoc.assoc, assoc => this.getAssocFields( assoc, config ) ), '}'
    ).join( ' ' );
  }

  protected setFieldDefaults( config:UiConfigType, path:string ):void {
    if( ! _.has(config, 'fields') ) {
      const entityConfig = this.adminService.getEntityConfig( path );
      _.set( config, 'fields', entityConfig ? _.keys(entityConfig.fields) : [] );
    }
    config.fields = _.map( config.fields, field => _.isString( field ) ? { name: field } : field );
  }

  protected warn<T>( message:string, type:T ):T {
    console.warn(message);
    return type;
  }

}
