import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { OrganisationOverviewGQL } from 'src/generated/graphql';

@Component({
  selector: 'app-organisation',
  templateUrl: './organisation.component.html',
  styleUrls: ['./organisation.component.scss']
})
export class OrganisationComponent implements OnInit {

  id:string;
  organisation:any;
  loading = true;

  constructor(
    private organisationOverviewGQL:OrganisationOverviewGQL,
    private route:ActivatedRoute,
    private router:Router,
    private modal: NzModalService ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => { this.id = params['id'] });
    this.organisationOverviewGQL.watch({id: this.id}).valueChanges.subscribe(({data, loading}) => {
      this.organisation = data['organisation'];
      this.loading = loading;
    });
  }

  selectOrganisationalUnit(id:string){}


}
