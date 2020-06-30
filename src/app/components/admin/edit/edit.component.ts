import { Component } from '@angular/core';
import gql from 'graphql-tag';
import * as _ from 'lodash';
import { EntityConfigType, FieldConfigType } from 'src/app/services/admin.service';

import { AdminEntityComponent } from '../admin-entity.component';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent extends AdminEntityComponent {

  get fields():FieldConfigType[] { return this.config.edit.fields as FieldConfigType[] }

  getQuery(){
    const fields = this.buildFieldQuery( this.config.edit );
    const query = `query EntityQuery($id: ID!){ ${this.config.edit.query}(id: $id) ${ fields } }`;
    return {
      query: gql(query),
      variables: {id: this.id},
      fetchPolicy: 'network-only'
    };
  }

  setData( data:any ):void {
    this.item = _.get( data, this.config.edit.query );
  }

  onSave(){
    this.updateMutation();
  }

  onCancel(){
    this.router.navigate(['/admin', this.path, this.id ] );
  }

  protected setDefaults( config:EntityConfigType ):EntityConfigType {
    if( ! _.has(config, 'edit') ) _.set( config, 'edit', {} );
    if( ! _.has( config.edit, 'query' ) ) _.set( config.edit, 'query', config.typeQuery );
    this.setFieldDefaults( config.edit, this.path);
    return config;
  }
}
