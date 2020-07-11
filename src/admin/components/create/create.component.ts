import { Component } from '@angular/core';
import * as _ from 'lodash';

import { EditComponent } from '../edit/edit.component';
import { AdminEntityComponent } from '../admin-entity.component';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent extends AdminEntityComponent {

  submit = new Subject<any>();

  onSave = () => this.submit.next();
  onCancel = () => this.onShow();
  onSuccess = ( id:string ) => {
    this.message.info(`This ${this.title() } was successfully created!` );
    setTimeout( ()=> this.gotoShow( this.data.path, id, this.data.parent ), 200 );
  }

}
