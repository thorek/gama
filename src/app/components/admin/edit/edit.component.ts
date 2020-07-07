import { Component } from '@angular/core';
import gql from 'graphql-tag';
import * as _ from 'lodash';

import { AdminEntityComponent } from '../admin-entity.component';
import { FieldConfigType } from 'src/app/lib/admin-config';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent extends AdminEntityComponent {

  get fields():FieldConfigType[] { return this.data.config.edit.fields as FieldConfigType[] }

  onSave = () => this.updateMutation();
  onCancel = () => this.onShow();


  /**
   *
   */
  protected updateMutation( id?:string, item?:any ){
    // if( ! id ) id = this.id;
    // if( ! item ) item = this.item;
    // const updateMutation =
    //   gql`mutation($input: ${this.config.updateInput}) {
    //     ${this.config.updateMutation}(${this.config.typeQuery}: $input ){
    //       validationViolations{
    //         attribute
    //         violation
    //       }
    //     }
    //   }`;
    // this.apollo.mutate({
    //   mutation: updateMutation,
    //   variables: { input: this.getItemInput( this.item ) },
    //   errorPolicy: 'all'
    // }).subscribe(({data}) => {
    //   const violations = _.get( data, 'validationViolations' );
    //   if( _.size( violations ) === 0 ) {
    //     this.message.info(`This ${this.title('edit')} was updated!` );
    //     setTimeout( ()=> this.onShow(), 500 );
    //   } else {
    //     this.message.error( _.join(violations, '\n') );
    //   }
    // });
  }

  protected getItemInput( item:any ){
    return _.pick( item, _.keys(this.data.config.fields), 'id' );
  }

}
