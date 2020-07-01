import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

const query = gql`
  query {
    metaData {
      path
      typeQuery
      typesQuery
      deleteMutation
      updateMutation
      updateInput
      createMutation
      createInput
      fields {
        name
        type
        virtual
        required
        unique
      }
      assocTo {
        path
        query
      }
      assocToMany {
        path
        query
      }
      assocFrom {
        path
        query
      }
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class MetaDataService {

  private metaData:any[];

  constructor(private apollo:Apollo) {}

  async getMetaData():Promise<any[]> {
    if( ! this.metaData ) await this.loadMetaData();
    return this.metaData;
  }

  private loadMetaData():Promise<void>{
    return new Promise( (resolve, reject) => {
      this.apollo.watchQuery<any>({ query }).valueChanges.subscribe(({ data, loading }) => {
        if( loading ) return;
        this.metaData = data.metaData;
        resolve();
      });
    });
  }


}
