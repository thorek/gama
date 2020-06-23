import { Component, OnInit, OnDestroy } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Router, ActivatedRoute } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import gql from 'graphql-tag';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit, OnDestroy {

  name:string;
  entities:any;
  loading = true;
  private querySubscription: Subscription;

  fields = ['id', 'name', 'city', 'dsb' ];

  constructor(
    private apollo:Apollo,
    private route:ActivatedRoute,
    private router:Router,
    private modal: NzModalService ) {}


  ngOnInit() {
    this.route.params.subscribe( params => { this.name = params['entity'] } );
    this.querySubscription = this.apollo.watchQuery<any>({
      query: gql`
        query Clients {
          clients {
            id
            name
            city
            dsb
          }
        }
      `})
      .valueChanges
      .subscribe(({ data, loading }) => {
        this.loading = loading;
        this.entities = data.clients;
      });
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }


  newEntity() { console.log('new client') }
  selectEntity(id:string) { this.router.navigate(['admin', name, id]) }
  deleteEntity(id:string) {
    this.modal.confirm({
      nzTitle: 'Are you sure delete this entity?',
      nzContent: '<b style="color: red;">All related entities will be deleted too!</b>',
      nzOkText: 'Yes',
      nzOkType: 'danger',
      nzOnOk: () => console.log('OK'),
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel')
    });
  }

}
