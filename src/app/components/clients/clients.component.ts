import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';

import { AllClientsGQL } from '../../../generated/graphql';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {

  clients:any;
  loading = true;

  constructor(
    private allClients:AllClientsGQL,
    private router:Router,
    private modal: NzModalService ) {}

  ngOnInit(): void {
    this.allClients.watch().valueChanges.subscribe(({data, loading}) => {
      this.clients = data['clients'];
      this.loading = loading;
    });
  }

  newClient() { console.log('new client') }
  selectClient(id:string) { this.router.navigate(['clients', id]) }
  deleteClient(id:string) {
    this.modal.confirm({
      nzTitle: 'Are you sure delete this client?',
      nzContent: '<b style="color: red;">All related entities will be deleted too!</b>',
      nzOkText: 'Yes',
      nzOkType: 'danger',
      nzOnOk: () => console.log('OK'),
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel')
    });
  }

}
