import { registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import en from '@angular/common/locales/en';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzDividerModule } from 'ng-zorro-antd/divider';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { ClientComponent } from './components/client/client.component';
import { ClientsComponent } from './components/clients/clients.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { GraphQLModule } from './graphql.module';
import { IconsProviderModule } from './icons-provider.module';
import { OrganisationsComponent } from './components/organisations/organisations.component';
import { OrganisationComponent } from './components/organisation/organisation.component';
import { AboutComponent } from './components/about/about.component';
import { IndexComponent } from './components/admin/index/index.component';
import { HeaderComponent } from './components/shared/header/header.component';
import { TableComponent } from './components/shared/table/table.component';

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
    IndexComponent,
    HeaderComponent,
    TableComponent
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
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    GraphQLModule
  ],
  providers: [{ provide: NZ_I18N, useValue: en_US }],
  bootstrap: [AppComponent]
})
export class AppModule { }
