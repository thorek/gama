import * as _ from 'lodash';
import { Component, OnInit } from '@angular/core';
import { OrganisationsGQL } from 'src/generated/graphql';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-organisations',
  templateUrl: './organisations.component.html',
  styleUrls: ['./organisations.component.scss']
})
export class OrganisationsComponent implements OnInit {

  organisations:any;
  loading = true;

  constructor(
    private organisationsGql:OrganisationsGQL,
    private router:Router,
    private modal: NzModalService ) {}

  ngOnInit(): void {
    this.organisationsGql.watch().valueChanges.subscribe(({data, loading}) => {
      this.organisations = data['organisations'];
      this.loading = loading;
    });
  }

  newOrganisation() { console.log('new organisation') }
  selectOrganisation(id:string) { this.router.navigate(['organisations', id]) }
  selectClient(id:string) { this.router.navigate(['clients', id]) }
  deleteOrganisation(id:string) {
    this.modal.confirm({
      nzTitle: 'Are you sure delete this organisation?',
      nzContent: '<b style="color: red;">All related entities will be deleted too!</b>',
      nzOkText: 'Yes',
      nzOkType: 'danger',
      nzOnOk: () => console.log('OK'),
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel')
    });
  }
  industries( organisation:any ):string {
    return _.join( _.map( organisation.industries, (industry:any) => industry.name ), ', ');
  }

}
