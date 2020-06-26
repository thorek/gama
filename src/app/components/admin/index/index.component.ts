import { Component } from '@angular/core';
import gql from 'graphql-tag';
import * as _ from 'lodash';
import { EntityConfigType } from 'src/app/services/admin.service';

import { AdminComponent } from '../admin.component';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent extends AdminComponent {

  items:any;
  get columns() { return this.config.index.fields }

  getQuery(){
    return { query: gql`query{ ${this.config.index.query} ${ this.buildFieldQuery( this.config.index ) } }` };
  }

  setData( data:any ):void {
    this.items = _.get( data, this.config.index.query );
  }

  protected setDefaults( config:EntityConfigType ):EntityConfigType {
    if( ! _.has(config, 'index') ) _.set( config, 'index', {} );
    if( ! _.has( config.index, 'query' ) ) _.set( config.index, 'query', config.typesQuery );
    this.setFieldDefaults( config.index, this.path);
    return config;
  }
}
