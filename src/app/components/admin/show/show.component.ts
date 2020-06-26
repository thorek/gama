import { Component } from '@angular/core';
import gql from 'graphql-tag';
import * as _ from 'lodash';
import { AdminComponent } from '../admin.component';
import { EntityConfigType } from 'src/app/services/admin.service';

@Component({
  selector: 'app-show',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowComponent extends AdminComponent {

  item:any;
  get fields() { return this.config.show.fields }

  getQuery(){
    const fields = this.buildFieldQuery( this.config.show );
    return {
      query: gql`query EntityQuery($id: ID!){ ${this.config.show.query}(id: $id) ${ fields } }`,
      variables: {id: this.id}
    };
  }

  setData( data:any ):void {
    this.item = _.get( data, this.config.show.query );
  }

  protected setDefaults( config:EntityConfigType ):EntityConfigType {
    if( ! _.has(config, 'show') ) _.set( config, 'show', {} );
    if( ! _.has(config, 'show.fields') ) _.set( config, 'show.fields', _.keys( config.fields ) );
    config.show.fields = _.map( config.show.fields, col => _.isString( col ) ? { name: col } : col );
    if( ! _.has( config, 'show.query' ) ) _.set( config, 'show.query', config.typeQuery );
    return config;
  }
}
