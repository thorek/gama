import { PortalModule } from '@angular/cdk/portal';
import { CommonModule, registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import en from '@angular/common/locales/en';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';

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
import { IconsProviderModule } from './icons-provider.module';
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
    IconsProviderModule,
    NzLayoutModule,
    NzMenuModule,
    NzTableModule,
    NzPageHeaderModule,
    NzSpaceModule,
    NzButtonModule,
    NzModalModule,
    NzDescriptionsModule,
    NzBadgeModule,
    NzDividerModule,
    NzAlertModule,
    NzMessageModule,
    NzFormModule,
    NzInputModule,
    NzBreadCrumbModule,
    NzIconModule,
    NzSpinModule,
    NzSelectModule,
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
    { provide: NZ_I18N, useValue: en_US }
  ]
})
export class AdminModule { }
