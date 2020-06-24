import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import * as _ from 'lodash';
import { NzModalService } from 'ng-zorro-antd/modal';
// import { FieldType } from 'src/app/services/meta-data.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {

  name:string;
  metaData:any;
  entities:any;
  loading = true;

  get fields() { return this.metaData ? this.metaData.fields : [] }

  constructor(
    // private metaDataService:MetaDataService,
    private apollo:Apollo,
    private route:ActivatedRoute,
    private router:Router,
    private modal:NzModalService ) {}


  ngOnInit() {
    this.route.params.subscribe( params => this.getMetaData( params['path']) );
  }

  /**
   *
   */
  private getMetaData( path:string ){
    // const meta = _.get( this.metaDataService.adminConfig, ['entities', path, 'index' ]);
    // const q = `query { ${path} ${ this.buildFieldQuery(path, meta.fields) } }`
    // console.log({q})
    // const query = gql`${q}`;
    // const query = gql`
    // query MetaData($path: String!) {
    //   metaData(path: $path) {
    //     name, typesQuery, fields { name, label }
    //   }
    // }`;
    // console.log({query})
    // this.apollo.watchQuery<any>({
    //   query, variables: { path }})
    //   .valueChanges
    //   .subscribe(({ data, loading }) => {
    //     this.loading = loading;
    //     this.metaData = _.first( data.metaData );
    //     if( this.metaData ) this.loadData();
    //   });
  }

  // private buildFieldQuery( path:string, fields:FieldType[] ):string {
  //   return `${path} { ${
  //     _.join( _.map( fields, field => {
  //       if( _.isString( field ) ) return field;
  //       // if( _.has( field, 'fields' ) ) return this.buildFieldQuery( field.name, field.fields );
  //       return field.name;
  //     }))
  //   } }`;
  // }

  /**
   *
   */
  private loadData(){
    const query = gql`
      query Entities {
        ${this.metaData.typesQuery} {
          ${ _.join( _.map(this.metaData.fields, field => field.name ), ', ')}
        }
      }
    `;
    console.log( { query })
    this.name = this.metaData.name;
    this.apollo.watchQuery<any>({ query })
      .valueChanges
      .subscribe(({ data, loading }) => {
        this.loading = loading;
        this.entities = _.get(data, this.metaData.typesQuery );
      });
  }


  newEntity() { console.log('new client') }
  selectEntity(id:string) { this.router.navigate(['admin', name, id]) }
  deleteEntity(id:string) {
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
