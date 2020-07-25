import { Component, Input } from '@angular/core';

@Component({
  selector: 'admin-breadcrumb',
  template: `
    <admin-dyn-content selector="#breadcrumb">
      &nbsp; /
      <a [routerLink]="['/admin/home']">Admin</a>
      <ng-container *ngFor="let item of items">
        &nbsp; / <a [routerLink]="item.link">{{ item.text }}</a>
      </ng-container>
    </admin-dyn-content>
  `
})
export class BreadcrumComponent {

  @Input() items:any = [];
}
