import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import * as _ from 'lodash';

import { AdminConfigType, EntityConfigType, AdminConfig } from '../lib/admin-config';
import { MetaDataService } from './meta-data.service';
import { AdminData } from '../lib/admin-data';
import gql from 'graphql-tag';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({providedIn: 'root'})
export class AdminService {

  private adminConfig:AdminConfigType;

  constructor(
    private metaDataService:MetaDataService,
    protected apollo:Apollo,
    protected message:NzMessageService ){}

  async init( adminConfig:() => Promise<AdminConfigType> ):Promise<any>{
    const metaData = await this.metaDataService.getMetaData();
    this.adminConfig = await AdminConfig.getInstance().getConfig( metaData, adminConfig );
  }

  getMenuEntities():EntityConfigType[] {
    return this.adminConfig.menu ?
      _.compact( _.map( this.adminConfig.menu, item => this.adminConfig.entities[item] ) ) :
      _.values( this.adminConfig.entities );
  }

  getEntityConfig( path:string ):EntityConfigType {
    if( ! this.adminConfig ) throw new Error(`AdminService not yet initialized`);
    return _.get( this.adminConfig, ['entities', path] );
  }

  /**
   *
   */
  delete( adminData:AdminData ):Promise<string[]>{
    const deleteItem = gql`mutation { ${adminData.config.deleteMutation}(id: "${adminData.id}" )  }`;
    return new Promise( resolve => {
      this.apollo.mutate({ mutation: deleteItem }).subscribe(({data}) => {
        const violations = _.get( data, adminData.config.deleteMutation ) as string[];
        resolve( violations );
      });
    });
  }
}
