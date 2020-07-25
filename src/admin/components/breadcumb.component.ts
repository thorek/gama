import { Component, Input } from '@angular/core';

@Component({
  selector: 'admin-breadcrumb',
  template: `
    <admin-dyn-content selector="#breadcrumb">
      &nbsp;
      /
      <a [routerLink]="['/admin/home']">Admin</a>
      /
      Clients / Ein Kunde / Organisations / Eine Organisation
    </admin-dyn-content>
  `,
  styles: [`
    a, a:visited, a:hover, a:active {
      color: inherit;
    }
  `]
})
export class BreadcrumComponent {

  @Input() items:any = [];
}
