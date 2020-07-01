import { Component } from '@angular/core';
import gql from 'graphql-tag';
import * as _ from 'lodash';
import { AssocTableConfigType, FieldConfigType } from 'src/app/services/admin.service';

import { AdminEntityComponent } from '../admin-entity.component';

@Component({
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowComponent extends AdminEntityComponent {

  get fields():FieldConfigType[] { return this.config.show.fields as FieldConfigType[] }
  get detailTables() { return this.config.show.table }

  tableItems( table:AssocTableConfigType ):any[]{
    const query = _.get( this.config.assoc, [table.path, 'query']);
    return _.get( this.item, query );
  }

  getQuery(){
    const filter = '(id: $id)';
    const fields = this.buildFieldQuery( this.config.show );
    const query = `query EntityQuery($id: ID!){ ${this.config.show.query}${filter} ${ fields } }`;
    return {
      query: gql(query),
      variables: {id: this.id},
      fetchPolicy: 'network-only'
    };
  }

  setData = ( data:any ) => this.item = _.get( data, this.config.show.query );

}
