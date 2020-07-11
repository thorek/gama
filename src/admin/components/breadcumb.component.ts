import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-breadcrumb',
  template: `
    <app-dyn-content selector="#breadcrumb">

      <nz-breadcrumb>
        <nz-breadcrumb-item>
          <i nz-icon nzType="home"></i>
        </nz-breadcrumb-item>
        <nz-breadcrumb-item *ngFor="let item of items">
          <a>
            <i nz-icon [nzType]="item.icon"></i>
            <span>{{ item.text }}</span>
          </a>
        </nz-breadcrumb-item>
      </nz-breadcrumb>

    </app-dyn-content>
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
