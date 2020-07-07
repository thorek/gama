import { Component } from '@angular/core';
import * as _ from 'lodash';

import { AdminEntityComponent } from '../admin-entity.component';
import { FieldConfigType, AssocTableConfigType } from 'src/app/lib/admin-config';

@Component({
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowComponent extends AdminEntityComponent {

  get fields():FieldConfigType[] { return this.data.config.show.fields as FieldConfigType[] }
  get detailTables() { return this.data.config.show.table }

  tableItems( table:AssocTableConfigType ):any[]{
    const query = _.get( this.data.config.assoc, [table.path, 'query']);
    return _.get( this.data.item, query );
  }


}
