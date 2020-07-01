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
import { FormBuilder } from '@angular/forms';

export type ParentType = { path:string, id:string }

export abstract class AdminEntityComponent extends AdminComponent implements OnInit {

  id?:string;
  path:string;
  parent?:ParentType;
  item?:any;
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
    protected message:NzMessageService,
    protected fb:FormBuilder) { super() }

    protected abstract getQuery():{query:any, variables?:any}|undefined;
    protected abstract setData( data:any ):void;

  ngOnInit() {
    this.route.params.subscribe( params => {
      this.id = params['id'];
      this.path = params['path'];
      if( params.parent && params.parentId ) this.parent = { id: params.parentId, path: params.parent };
      this.config = this.adminService.getEntityConfig(this.path);
      this.loadData();
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

  required( field:FieldConfigType ):boolean {
    const meta = this.config.fields[field.name];
    return _.get( meta, 'required' );
  }

  onNew = () => this.gotoNew( this.path, this.parent );
  onEdit = () =>  this.gotoEdit( this.path, this.id, this.parent )
  onShow = () => this.gotoShow( this.path, this.id, this.parent );
  onList = () => this.gotoList( this.path, this.parent );
  onSelect = (id:string) => this.gotoShow( this.path, id, this.parent );
  onChildSelect = (id:string, path:string) => this.gotoShow( path, id, { path: this.path, id: this.id } );

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

  gotoList( path:string, parent?:ParentType ){
    const commands = [ path ];
    if( parent ) commands.unshift( parent.path, parent.id );
    commands.unshift( 'admin' );
    this.router.navigate( commands );
  }

  gotoShow( path:string, id:string, parent?:ParentType ){
    const commands = [ path, 'show', id ];
    if( parent ) commands.unshift( parent.path, parent.id );
    commands.unshift( 'admin' );
    this.router.navigate( commands );
  }

  gotoEdit( path:string, id:string, parent?:ParentType ){
    const commands = [path, 'edit', id ];
    if( parent ) commands.unshift( parent.path, parent.id );
    commands.unshift( 'admin' );
    this.router.navigate( commands );
  }

  gotoNew( path:string, parent?:ParentType ){
    const commands = [path, 'new' ];
    if( parent ) commands.unshift( parent.path, parent.id );
    commands.unshift( 'admin' );
    this.router.navigate( commands );
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
        setTimeout( ()=> this.gotoList( this.path, this.parent ), 500 );
      } else {
        this.message.error( _.join(violations, '\n') );
      }
    });
  }

  protected async loadData(){
    const query = this.getQuery();
    if( ! query ) return this.setData({});
    this.apollo.watchQuery<any>( query )
      .valueChanges
      .subscribe(({ data, loading }) => {
        this.loading = loading;
        this.setData( data );
      }, error => this.error = error );
  }

  protected buildFieldQuery( config:UiConfigType ):string {
    const queryFields = _.intersection(
      _.keys(this.config.fields),
      _.map(config.fields, (field:FieldConfigType) => field.name ));
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


}
