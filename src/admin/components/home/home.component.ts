import { Component, Input } from '@angular/core';
import { AdminService } from 'src/admin/services/admin.service';
import { EntityConfigType } from 'src/admin/lib/admin-config';
import { AdminComponent } from '../admin.component';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends AdminComponent {

  entities:EntityConfigType[]

  constructor( private adminService:AdminService ) { super() }

  ngOnInit(){
    this.entities = this.adminService.getMenuEntities();
  }

  fields = ( entity:EntityConfigType ) => Object.values( entity.fields )
}
