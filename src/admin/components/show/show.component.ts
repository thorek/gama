import { Component } from '@angular/core';
import * as _ from 'lodash';
import { AdminEntityComponent } from 'src/admin/components/admin-entity.component';
import { AssocTableConfigType, FieldConfigType } from 'src/admin/lib/admin-config';

@Component({
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowComponent extends AdminEntityComponent {

  get fields():FieldConfigType[] { return this.data.entityConfig.show.fields as FieldConfigType[] }
  get detailTables() { return this.data.entityConfig.show.table }

  tableItems( table:AssocTableConfigType ):any[]{
    const query = _.get( this.data.entityConfig.assocs, [table.path, 'query']);
    return _.get( this.data.item, query );
  }


}
