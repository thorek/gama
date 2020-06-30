import { Component } from '@angular/core';
import gql from 'graphql-tag';
import * as _ from 'lodash';
import { EntityConfigType, AssocConfigType, AssocTableConfigType } from 'src/app/services/admin.service';

import { AdminEntityComponent } from '../admin-entity.component';

@Component({
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowComponent extends AdminEntityComponent {

  item:any;
  get fields() { return this.config.show.fields }
  get detailTables() { return this.config.show.table }

  tableItems( table:AssocTableConfigType ):any[]{
    const query = _.get( this.config.assoc, [table.path, 'query']);
    return _.get( this.item, query );
  }

  getQuery(){
    const fields = this.buildFieldQuery( this.config.show );
    const query = `query EntityQuery($id: ID!){ ${this.config.show.query}(id: $id) ${ fields } }`;
    return {
      query: gql(query),
      variables: {id: this.id},
      fetchPolicy: 'network-only'
    };
  }

  setData( data:any ):void {
    this.item = _.get( data, this.config.show.query );
  }

  protected setDefaults( config:EntityConfigType ):EntityConfigType {
    if( ! _.has(config, 'show') ) _.set( config, 'show', {} );
    if( ! _.has( config.show, 'query' ) ) _.set( config.show, 'query', config.typeQuery );
    this.setFieldDefaults( config.show, this.path);
    _.forEach( config.show.table, table => this.setFieldDefaults( table, table.path ) );
    return config;
  }
}
