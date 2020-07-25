import { Component, Input } from '@angular/core';

@Component({
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>
          Admin Home
        </mat-card-title>
      </mat-card-header>
      <hr>
      <mat-card-content>
        <p>
          some info about admin ...
        </p>
      </mat-card-content>
      <mat-card-actions>
        <button mat-button>LIKE</button>
        <button mat-button>SHARE</button>
      </mat-card-actions>
    </mat-card>
    <admin-breadcrumb></admin-breadcrumb>
  `
})
export class AdminHomeComponent {

}
