import { Component } from '@angular/core';

import { AdminEntityComponent } from '../admin-entity.component';
import { Subject } from 'rxjs';

@Component({
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent extends AdminEntityComponent {

  submit = new Subject<any>();

  onSave = () => this.submit.next();
  onCancel = () => this.onShow();
  onSuccess = () => {
    this.message.info(`This ${this.title() } was successfully updated!` );
    setTimeout( ()=> this.onShow(), 200 );
  }

}
