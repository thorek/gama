import { registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import en from '@angular/common/locales/en';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTableModule } from 'ng-zorro-antd/table';

import { adminConfig } from './admin.config';
import { AppRoutingModule } from './app-routing.module';
import { AboutComponent } from './components/about/about.component';
import { CreateComponent } from './components/admin/create/create.component';
import { EditComponent } from './components/admin/edit/edit.component';
import { IndexComponent } from './components/admin/index/index.component';
import { ShowComponent } from './components/admin/show/show.component';
import { AppComponent } from './components/app/app.component';
import { ClientComponent } from './components/client/client.component';
import { ClientsComponent } from './components/clients/clients.component';
import { OrganisationComponent } from './components/organisation/organisation.component';
import { OrganisationsComponent } from './components/organisations/organisations.component';
import { HeaderComponent } from './components/shared/header/header.component';
import { TableComponent } from './components/shared/table/table.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { GraphQLModule } from './graphql.module';
import { IconsProviderModule } from './icons-provider.module';
import { AdminService } from './services/admin.service';

registerLocaleData(en);

export function initializeApp1(adminService:AdminService) {
  return ():Promise<any> => {
    return adminService.init( adminConfig );
  }
}

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    ClientsComponent,
    ClientComponent,
    OrganisationsComponent,
    OrganisationComponent,
    AboutComponent,
    IndexComponent,
    HeaderComponent,
    TableComponent,
    ShowComponent,
    EditComponent,
    CreateComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
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
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    GraphQLModule
  ],
  providers: [
    AdminService,
    { provide: APP_INITIALIZER ,useFactory: initializeApp1, deps: [AdminService], multi: true },
    { provide: NZ_I18N, useValue: en_US }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
