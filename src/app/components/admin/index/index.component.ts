import { Component } from '@angular/core';
import gql from 'graphql-tag';
import * as _ from 'lodash';

import { AdminEntityComponent } from '../admin-entity.component';

@Component({
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent extends AdminEntityComponent {

  items:any;
  setData = ( data:any ) => this.items = _.get( data, this.config.index.query );
  private breadcrumbItems:any[] = undefined;

  getQuery(){
    const query = `query{ ${this.config.index.query} ${ this.buildFieldQuery( this.config.index ) } }`;
    return {
      query: gql(query),
      fetchPolicy: 'network-only'
    };
  }

  breadcrumbs(){
    if( this.breadcrumbItems ) return this.breadcrumbItems;
    this.breadcrumbItems = [ { text: this.title('index') } ];
    if( this.parent ) {
      const config = this.adminService.getEntityConfig( this.parent.path );
      this.breadcrumbItems.unshift( ...[
        { text: this.title('index', config) }
      ]);
    }
    return this.breadcrumbItems;
  }

}
