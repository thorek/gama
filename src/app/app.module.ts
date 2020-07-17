import { PortalModule } from '@angular/cdk/portal';
import { registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import en from '@angular/common/locales/en';
import { NgModule } from '@angular/core';
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
import { AdminModule } from 'src/admin/admin.module';
import { AdminService } from 'src/admin/services/admin.service';

import { AppRoutingModule } from './app-routing.module';
import { AboutComponent } from './components/about/about.component';
import { AppComponent } from './components/app/app.component';
import { ClientComponent } from './components/client/client.component';
import { ClientsComponent } from './components/clients/clients.component';
import { OrganisationComponent } from './components/organisation/organisation.component';
import { OrganisationsComponent } from './components/organisations/organisations.component';
import { HeaderComponent } from './components/shared/header/header.component';
import { WelcomeComponent } from './components/welcome/welcome.component';

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    ClientsComponent,
    ClientComponent,
    OrganisationsComponent,
    OrganisationComponent,
    AboutComponent,
    HeaderComponent,
  ],
  imports: [
    AdminModule,
    BrowserModule,
    AppRoutingModule,
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
    BrowserAnimationsModule,
    PortalModule
  ],
  providers: [
    AdminService,
    { provide: NZ_I18N, useValue: en_US }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
