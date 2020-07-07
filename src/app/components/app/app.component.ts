import * as _ from 'lodash';
import * as inflection from 'inflection';
import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { EntityConfigType } from 'src/app/lib/admin-config';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  isCollapsed = false;
  entities:EntityConfigType[]

  constructor( private adminService:AdminService ) {}

  ngOnInit(){
    this.entities = this.adminService.getMenuEntities();
  }

  title( entity:EntityConfigType ):string {
    if( _.isFunction( entity.title ) ) return entity.title();
    if( _.isString( entity.title ) ) return entity.title;
    return inflection.humanize( entity.path );
  }
}
