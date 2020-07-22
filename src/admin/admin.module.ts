import { PortalModule } from '@angular/cdk/portal';
import { CommonModule, registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import en from '@angular/common/locales/en';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminFormComponent } from './components/admin-form.component';
import { BreadcrumComponent } from './components/breadcumb.component';
import { CreateComponent } from './components/create/create.component';
import { DynContentComponent } from './components/dyn-content.component';
import { EditComponent } from './components/edit/edit.component';
import { IndexComponent } from './components/index/index.component';
import { ShowComponent } from './components/show/show.component';
import { TableComponent } from './components/table/table.component';
import { adminConfig } from './config/admin.config';
import { GraphQLModule } from './graphql.module';
import { AdminDataResolver } from './services/admin-data.resolver';
import { AdminService } from './services/admin.service';

registerLocaleData(en);

export function initializeApp1(adminService:AdminService) {
  return ():Promise<any> => {
    return adminService.init( adminConfig );
  }
}

@NgModule({
  declarations: [
    IndexComponent,
    TableComponent,
    ShowComponent,
    EditComponent,
    CreateComponent,
    DynContentComponent,
    BreadcrumComponent,
    AdminFormComponent
  ],
  imports: [
    AdminRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    PortalModule,
    GraphQLModule
  ],
  exports: [
    IndexComponent,
    ShowComponent,
    EditComponent,
    CreateComponent,
    TableComponent
  ],
  providers: [
    AdminService,
    AdminDataResolver,
    { provide: APP_INITIALIZER ,useFactory: initializeApp1, deps: [AdminService], multi: true },
  ]
})
export class AdminModule { }
