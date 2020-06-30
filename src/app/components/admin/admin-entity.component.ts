import { OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import * as inflection from 'inflection';
import * as _ from 'lodash';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {
  ActionEventType,
  AdminService,
  AssocConfigType,
  AssocTableConfigType,
  EntityConfigType,
  FieldConfigType,
  TitlePurposeType,
  UiConfigType,
} from 'src/app/services/admin.service';

import { AdminComponent } from './admin.component';

export abstract class AdminEntityComponent extends AdminComponent implements OnInit {

  id?:string;
  item?:any;
  path:string;
  loading = true;
  config:EntityConfigType;
  error:any;

  get entitiesName() { return _.get(this.config, 'entitesName' ) || inflection.humanize( this.path ) }
  get entityName() { return _.get(this.config, 'entityName' ) || inflection.humanize( inflection.singularize(this.path ) ) }
  get columns() { return this.config.index.fields } //?

  constructor(
    protected adminService:AdminService,
    protected apollo:Apollo,
    protected route:ActivatedRoute,
    protected router:Router,
    protected modal:NzModalService,
    protected message: NzMessageService) { super() }

    protected abstract getQuery():{query:any, variables?:any};
    protected abstract setData( data:any ):void;
    protected abstract setDefaults( config:EntityConfigType ):EntityConfigType;

  ngOnInit() {
    this.route.params.subscribe( params => {
      this.id = params['id'];
      this.loadData( params['path'])
     });
  }

  title(purpose:TitlePurposeType, config?:EntityConfigType|AssocTableConfigType):string {
    if( ! config ) config = this.config;
    if( _.isFunction( config.title ) ) return config.title( purpose );
    if( _.isString( config.title ) ) return config.title;
    return _.includes(['show','edit'], purpose ) ?
      inflection.humanize( inflection.singularize( config.path ) ) :
      inflection.humanize( config.path );
  }

  name( item?:any ){
    if( ! item ) item = this.item;
    if( _.isFunction(this.config.name) ) return this.config.name( item );
    const candidates = ['name', 'title', 'lastname', 'last_name', 'firstname', 'first_name'];
    for( const candidate of candidates) if ( _.has( item, candidate ) ) return _.get( item, candidate );
    return `#${item.id}`;
  }

  onNew( path?:string) {
    this.router.navigate(['admin', 'new', path ? path : this.path ])
  }
  onEdit(id?:any, path?:string) {
    this.router.navigate(['/admin', path ? path : this.path, 'edit', id ? id : this.id ])
  }
  onSelect(id:any, path?:string) {
    this.router.navigate(['admin', path ? path : this.path, id])
  }
  onAction = ( event:ActionEventType ) => {
    switch( event.action ){
      case 'delete': return this.onDelete( event.id );
    }
    if( _.isFunction( this.config.action ) ) this.config.action( event );
  }
  onDelete(id:string) {
    this.modal.confirm({
      nzTitle: `Are you sure delete this ${this.entityName}?`,
      nzContent: '<b style="color: red;">All related entities will be deleted too!</b>',
      nzOkText: 'Yes',
      nzOkType: 'danger',
      nzOnOk: () => this.deleteMutation( id ),
      nzCancelText: 'No',
      nzOnCancel: () => this.message.info('Nothing was deleted')
    });
  }

  gotoList( path?:string ){
    this.router.navigate(['admin', path ? path : this.path] );
  }

  gotoShow( path?:string, id?:string ){
    this.router.navigate(['admin', path ? path : this.path, id ? id : this.id] );
  }


  /**
   *
   */
  protected deleteMutation( id:string ){
    const deleteItem = gql`mutation { ${this.config.deleteMutation}(id: "${id}" )  }`;
    this.apollo.mutate({ mutation: deleteItem }).subscribe(({data}) => {
      const violations = _.get( data, this.config.deleteMutation ) as string[];
      if( _.size( violations ) === 0 ) {
        this.message.info(`This ${this.title('show')} was deleted!` );
        setTimeout( ()=> this.gotoList(), 500 );
      } else {
        this.message.error( _.join(violations, '\n') );
      }
    });
  }

  /**
   *
   */
  protected updateMutation( id?:string, item?:any ){
    if( ! id ) id = this.id;
    if( ! item ) item = this.item;
    const updateMutation =
      gql`mutation($input: ClientUpdateInput) {
        ${this.config.updateMutation}(${this.config.typeQuery}: $input ){
          validationViolations{
            attribute
            violation
          }
        }
      }`;
    this.apollo.mutate({
      mutation: updateMutation,
      variables: { input: this.getItemInput( this.item ) } }
    ).subscribe(({data}) => {
      const violations = _.get( data, 'validationViolations' );
      if( _.size( violations ) === 0 ) {
        this.message.info(`This ${this.title('edit')} was updated!` );
        setTimeout( ()=> this.gotoShow(), 500 );
      } else {
        this.message.error( _.join(violations, '\n') );
      }
    });
  }

  protected getItemInput( item:any ){
    return _.pick( item, _.keys(this.config.fields), 'id' );
  }

  protected async loadData( path:string ){
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
      query, '{ id ', fields, _.map( assoc.assoc, assoc => this.getAssocFields( assoc, config ) ), '}'
    ).join( ' ' );
  }

  protected setFieldDefaults( config:UiConfigType|AssocTableConfigType, path:string ):void {
    if( ! _.has(config, 'fields') ) {
      const entityConfig = this.adminService.getEntityConfig( path );
      _.set( config, 'fields', entityConfig ? _.keys(entityConfig.fields) : [] );
    }
    config.fields = _.map( config.fields, field => _.isString( field ) ? { name: field } : field );
  }

}
