import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';
import * as _ from 'lodash';
import {
  AdminConfig,
  AdminConfigType,
  EntityConfigType,
  SaveReturnType as SaveResultType,
} from 'src/admin/lib/admin-config';

import { MetaDataService } from './meta-data.service';

@Injectable({providedIn: 'root'})
export class AdminService {

  private adminConfig:AdminConfigType;

  constructor(
    private metaDataService:MetaDataService,
    protected apollo:Apollo ){}

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

  save( id:string|undefined, input:any, files:_.Dictionary<File>, config:EntityConfigType ):Promise<SaveResultType> {
    _(config.fields).filter( field => field.type === 'file' ).forEach( field => _.unset( input, field.name ) );
    const variables = _.set( {}, 'input', input );
    _.merge( variables, files );
    return id ? this.update( id, variables, config ) : this.create( variables, config );
  }

  private create( variables:any, config:EntityConfigType ):Promise<SaveResultType> {
    const mutation = this.getCreateMutation( config );
    const context = this.getMutationContext( variables );
    return new Promise( resolve => {
      this.apollo.mutate({ mutation, variables, context }).subscribe(({data}) => resolve({
        violations: _.get( data, [config.createMutation, 'validationViolations'] ),
        id: _.get( data, [config.createMutation, config.typeQuery, 'id'] )
      }));
    });
  }

  private getCreateMutation( config:EntityConfigType ):DocumentNode {
    return gql`mutation($input: ${config.createInput}) {
      ${config.createMutation}(${config.typeQuery}: $input ){
        validationViolations{ attribute message }
        ${config.typeQuery} { id }
      }
    }`;
  }

  private update( id:string, variables:any, config:EntityConfigType ):Promise<SaveResultType>{
    _.set( variables, 'input.id', id );
    const updateMutation = this.getUpdateMutation( config );
    const context = this.getMutationContext( variables );
    return new Promise( resolve => {
      this.apollo.mutate({mutation: updateMutation, variables, context }).subscribe(({data}) => resolve({
        violations: _.get( data, [config.updateMutation, 'validationViolations'] ),
        id: _.get( data, [config.updateMutation, config.typeQuery, 'id'] )
      }));
    });
  }

  private getUpdateMutation( config:EntityConfigType ):DocumentNode {
    const fileVariableDeclaration = _(this.fileAttributes(config)).map( attr => `$${attr}: Upload` ).join(' ');
    const fileVariableAssign = _(this.fileAttributes(config)).map( attr => `${attr}: $${attr}` ).join(' ');
    return gql`mutation($input: ${config.updateInput} ${fileVariableDeclaration} ) {
      ${config.updateMutation}(${config.typeQuery}: $input ${fileVariableAssign}){
        validationViolations{ attribute message }
        ${config.typeQuery} { id }
      }
    }`;
  }

  private getMutationContext = (variables:any) => ({ useMultipart: _.keys( variables ).length > 0 });

  private fileAttributes( config:EntityConfigType ):string[] {
    return _(config.fields).filter( field => field.type === 'file' ).map( field => field.name ).value();
  }
}
