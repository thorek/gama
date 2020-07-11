import { OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ActionEventType, TitlePurposeType, EntityConfigType, FieldConfigType, LinkValueType } from 'src/admin/lib/admin-config';
import { AdminData } from 'src/admin/lib/admin-data';
import { AdminService } from 'src/admin/services/admin.service';

import { AdminComponent } from './admin.component';

export abstract class AdminEntityComponent extends AdminComponent implements OnInit {

  data:AdminData;
  breadcrumbs:any[] = [];

  constructor(
    protected adminService:AdminService,
    protected route:ActivatedRoute,
    protected router:Router,
    protected modal:NzModalService,
    protected message:NzMessageService,
    protected fb:FormBuilder) { super() }


  ngOnInit() {
    this.route.data.subscribe( async (data:AdminData) => {
      this.data = _.get(data, 'data');
      this.buildBreadcrumbs();
      this.buildForm();
     });
  }

  onList = () => this.gotoList( this.data.path, this.data.parent );
  onNew = () => this.gotoNew( this.data.path, this.data.parent );
  onEdit = () =>  this.gotoEdit( this.data.path, this.data.id, this.data.parent )
  onShow = () => this.gotoShow( this.data.path, this.data.id, this.data.parent );
  onSelect = (id:string) => this.gotoShow( this.data.path, id, this.data.parent );
  onChildSelect = (id:string, path:string) => this.gotoShow( path, id, this.data );

  onAction = ( event:ActionEventType ) => {
    switch( event.action ){
      case 'delete': return this.onDelete( event.id );
    }
    if( _.isFunction( this.data.entityConfig.action ) ) this.data.entityConfig.action( event );
  }

  onDelete(id?:string) {
    if( ! id ) id = this.data.id;
    this.modal.confirm({
      nzTitle: `Are you sure delete this ${this.data.entityName}?`,
      nzContent: '<b style="color: red;">All related entities will be deleted too!</b>',
      nzOkText: 'Yes',
      nzOkType: 'danger',
      nzOnOk: () => this.delete( id ),
      nzCancelText: 'No',
      nzOnCancel: () => this.message.info('Nothing was deleted')
    });
  }

  private async delete( id:string ){
    const violations = await this.adminService.delete( id, this.data.entityConfig.deleteMutation );
    if( _.size( violations ) === 0 ) {
      this.message.info(`This ${this.title('show')} was deleted!` );
      setTimeout( ()=> this.onList(), 500 );
    } else this.message.error( _.join(violations, '\n') );
  }

  gotoList( path:string, parent?:AdminData ){
    const commands = [ path ];
    if( parent ) commands.unshift( parent.path, parent.id );
    commands.unshift( 'admin' );
    this.router.navigate( commands );
  }

  gotoShow( path:string, id:string, parent?:{id:string, path:string} ){
    const commands = [ path, 'show', id ];
    if( parent ) commands.unshift( parent.path, parent.id );
    commands.unshift( 'admin' );
    this.router.navigate( commands );
  }

  gotoEdit( path:string, id:string, parent?:AdminData ){
    const commands = [path, 'edit', id ];
    if( parent ) commands.unshift( parent.path, parent.id );
    commands.unshift( 'admin' );
    this.router.navigate( commands );
  }

  gotoNew( path:string, parent?:AdminData ){
    const commands = [path, 'new' ];
    if( parent ) commands.unshift( parent.path, parent.id );
    commands.unshift( 'admin' );
    this.router.navigate( commands );
  }

  protected buildBreadcrumbs(){
    this.breadcrumbs = [ { text: this.title('index') } ];
    if( this.data.parent ) {
      const config = this.adminService.getEntityConfig( this.data.parent.path );
      this.breadcrumbs.unshift( ...[
        { text: this.title( 'index', config ) }
      ]);
    }
  }

  protected buildForm() { /* to be overwritten in create / edit */ }

  title( purpose?:TitlePurposeType, config?:EntityConfigType ):string {
    if( ! config ) config = this.data.entityConfig;
    return super.title( purpose, config );
  }

  name( item?:any, config?:EntityConfigType ){
    if( ! item ) item = this.data.item;
    if( ! config ) config = this.data.entityConfig;
    return super.name( item, config );
  }

  value( field:FieldConfigType, item?:any ){
    if( ! item ) item = this.data.item;
    return super.value( field, item );
  }

}
