import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientOverviewGQL } from 'src/generated/graphql';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit {

  id:string;
  client:any;
  loading = true;

  constructor(
    private allClients:ClientOverviewGQL,
    private route:ActivatedRoute,
    private router:Router,
    private modal: NzModalService ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => { this.id = params['id'] });
    this.allClients.watch({id: this.id}).valueChanges.subscribe(({data, loading}) => {
      this.client = data['client'];
      this.loading = loading;
    });
  }

  selectOrganisation( id:string ){ this.router.navigate(['organisations', id]) }

}
