import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import * as _ from 'lodash';
import { NzMessageService } from 'ng-zorro-antd/message';

import { AdminConfig, AdminConfigType, EntityConfigType, ViolationType } from '../lib/admin-config';
import { MetaDataService } from './meta-data.service';

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
  delete( id:string, deleteMutation:string ):Promise<string[]>{
    const deleteItem = gql`mutation { ${deleteMutation}(id: "${id}" )  }`;
    return new Promise( resolve => {
      this.apollo.mutate({ mutation: deleteItem }).subscribe(({data}) => {
        const violations = _.get( data, deleteMutation ) as string[];
        resolve( violations );
      });
    });
  }

  update( id:string, input:any, config:EntityConfigType ):Promise<ViolationType[]>{
    const updateMutation =
      gql`mutation($input: ${config.updateInput}) {
        ${config.updateMutation}(${config.typeQuery}: $input ){
          validationViolations{ attribute message }
        }
      }`;
    input = _.set( input, 'id', id );
    return new Promise( resolve => {
      this.apollo.mutate({
        mutation: updateMutation,
        variables: { input },
        errorPolicy: 'all'
      }).subscribe(({data}) => {
        const violations = _.get( data, [config.updateMutation, 'validationViolations'] );
        resolve( violations );
      });
    });
  }
}
