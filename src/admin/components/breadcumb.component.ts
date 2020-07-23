import { Component, Input } from '@angular/core';

@Component({
  selector: 'admin-breadcrumb',
  template: `
    <admin-dyn-content selector="#breadcrumb">
      Breadcrumbs
      <!--nz-breadcrumb>
        <nz-breadcrumb-item>
          <i nz-icon nzType="home"></i>
        </nz-breadcrumb-item>
        <nz-breadcrumb-item *ngFor="let item of items">
          <a>
            <i nz-icon [nzType]="item.icon"></i>
            <span>{{ item.text }}</span>
          </a>
        </nz-breadcrumb-item>
      </nz-breadcrumb-->

    </admin-dyn-content>
  `,
  styles:[`
    nz-breadcrumb {
      display: contents;
    }
  `]
})
export class BreadcrumComponent {

  @Input() items:any = [];
}
