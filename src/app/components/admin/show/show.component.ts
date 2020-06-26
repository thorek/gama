import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import * as _ from 'lodash';
import * as inflection from 'inflection';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FieldType, MetaDataService, EntityConfigType } from 'src/app/services/meta-data.service';

@Component({
  selector: 'app-show',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowComponent implements OnInit {

  name:string;
  path:string;
  typesName:string;
  typeName:string;
  fields:FieldType[];
  tableFields:FieldType[];
  entity:any;
  loading = true;

  constructor(
    private metaDataService:MetaDataService,
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
    const meta = _.get( await this.metaDataService.adminConfig(), ['entities', path ]);
    this.setMetaData( meta );
    const query = gql`query{ ${ this.buildFieldQuery(path, this.fields) } }`;
    this.apollo.watchQuery<any>({
      query, variables: { path }})
      .valueChanges
      .subscribe(({ data, loading }) => {
        this.loading = loading;
        this.entity = _.get( data, path );
      });
  }

  private buildFieldQuery( path:string, fields:(string|FieldType)[] ):string {
    return `${path} { ${
      _.join( _.map( fields, field => {
        if( _.isString( field ) ) return field;
        if( _.has( field, 'fields' ) ) return this.buildFieldQuery( field.name, field.fields );
        return field.name;
      }), ' ')
    } }`;
  }

  private setMetaData( meta:EntityConfigType ):void {
    this.name = meta.name( this.entity, 'show' );
    this.typesName = _.get( meta, 'typesName', inflection.humanize(this.path));
    this.typeName = _.get( meta, 'typesName', inflection.humanize( inflection.singularize(this.path)));
    this.fields = _.map( meta.fields, field => {
      if( _.isString( field ) ) field = {name: field};
      if( ! field.label ) field.label = inflection.humanize( field.name );
      return field;
    });
    this.tableFields = _.filter( this.fields, field => field.index !== false );
  }



  value(entity:any, field:string|FieldType){
    if( _.isString(field) ) return _.get(entity, field);
    return _.isFunction( field.value ) ? field.value( entity, 'show' ) : _.get( entity, field.name );
  }

  onNew() { console.log('new ', this.typeName ) }
  onSelect(id:any) { this.router.navigate(['admin', this.path, id]) }
  onDelete(id:string) {
    this.modal.confirm({
      nzTitle: 'Are you sure delete this entity?',
      nzContent: '<b style="color: red;">All related entities will be deleted too!</b>',
      nzOkText: 'Yes',
      nzOkType: 'danger',
      nzOnOk: () => console.log('OK'),
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel')
    });
  }
}
