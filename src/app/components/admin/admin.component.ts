import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import * as inflection from 'inflection';
import * as _ from 'lodash';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AdminService, EntityConfigType, FieldConfigType, UiConfigType } from 'src/app/services/admin.service';

export abstract class AdminComponent implements OnInit {

  id?:string;
  path:string;
  loading = true;
  config:EntityConfigType;
  error:any;

  get entitiesName() { return this.config.entitesName || inflection.humanize( this.path ) }
  get entityName() { return this.config.entityName || inflection.humanize( inflection.singularize(this.path ) ) }

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
    console.log( this.config )

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
    const assocFields = _.join( _.compact( _.map( config.assoc, (assoc, name) => {
      const assocDefinition = _.get( this.config.assoc, name );
      if( ! assocDefinition ) return console.warn( `no such assoc '${name}'` );
      return `${assocDefinition.query} ${ this.buildFieldQuery( assoc) }`;
    })), ' ');
    console.log( { assocFields })
    return `{ id ${ _.join( _.concat( queryFields, assocFields ), ' ' ) } }`;
  }

  protected setFieldDefaults( config:UiConfigType, path:string ):void {
    if( ! _.has(config, 'fields') ) {
      const entityConfig = this.adminService.getEntityConfig( path );
      _.set( config, 'fields', entityConfig ? _.keys(entityConfig.fields) : [] );
    }
    config.fields = _.map( config.fields, field => _.isString( field ) ? { name: field } : field );
  }

}
