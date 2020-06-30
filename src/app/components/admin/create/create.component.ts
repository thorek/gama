import { Component } from '@angular/core';
import gql from 'graphql-tag';
import * as _ from 'lodash';
import { EntityConfigType, FieldConfigType } from 'src/app/services/admin.service';

import { AdminEntityComponent } from '../admin-entity.component';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent extends AdminEntityComponent {

  get fields():FieldConfigType[] { return this.config.create.fields as FieldConfigType[] }

  getQuery(){ return undefined }

  setData( data:any ):void { this.item = data }

  onSave(){
    this.updateMutation();
  }

  onCancel(){
    this.router.navigate(['/admin', this.path, this.id ] );
  }

  protected setDefaults( config:EntityConfigType ):EntityConfigType {
    if( ! _.has(config, 'create') ) _.set( config, 'create', {} );
    if( ! _.has( config.create, 'query' ) ) _.set( config.create, 'query', config.typeQuery );
    this.setFieldDefaults( config.create, this.path);
    return config;
  }
}
