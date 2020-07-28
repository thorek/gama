import * as _ from 'lodash';
import * as inflection from 'inflection';
import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/admin/services/admin.service';
import { EntityConfigType } from 'src/admin/lib/admin-config';

import {Event,
NavigationCancel,
NavigationEnd,
NavigationError,
NavigationStart,
Router
} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  loading = false;
  isCollapsed = false;
  entities:EntityConfigType[]

  constructor(
    private router:Router,
    private adminService:AdminService
  ) {}

  ngOnInit(){
    this.entities = this.adminService.getMenuEntities();
    this.router.events.subscribe((event:Event) => {
      switch (true) {
        case event instanceof NavigationStart: {
          // setTimeout(() => { this.loading = true }, 100);
          this.loading = true;
          break;
        }

        case event instanceof NavigationEnd:
        case event instanceof NavigationCancel:
        case event instanceof NavigationError: {
          this.loading = false;
          break;
        }
        default: {
          break;
        }
      }
    });
  }

  title( entity:EntityConfigType ):string {
    if( _.isFunction( entity.title ) ) return entity.title();
    if( _.isString( entity.title ) ) return entity.title;
    return inflection.humanize( entity.path );
  }
}
