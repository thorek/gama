import * as _ from 'lodash';
import { Injectable } from '@angular/core';

export type FieldType = string|{name:string, label?:string, value?:(entity:any) => any, fields?:string[] }
export type AdminConfigType = {entities?:{ [entity:string]:{ index?:{ fields?:FieldType[]}}}}

@Injectable({providedIn: 'root'})
export class MetaDataService {

  get adminConfig():AdminConfigType { return {
    entities:{
      clients:{
        index: {
          fields: [ 'id', 'name', 'city' ]
        }
      },
      organisations:{
        index: {
          fields: [
            'id',
            'name',
            { name: 'industries', fields: ['name'], value: (organisation:any) =>
              _.join( _.map( organisation.industries, (industry:any) => industry.name ), ', ') },
            { name: 'client', fields: ['name'], value: (organisation:any)=> organisation.client.name },
          ]
        }
      }
    }
  }}

}
