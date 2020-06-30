import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { ClientsComponent } from './components/clients/clients.component';
import { ClientComponent } from './components/client/client.component';
import { OrganisationsComponent } from './components/organisations/organisations.component';
import { OrganisationComponent } from './components/organisation/organisation.component';
import { AboutComponent } from './components/about/about.component';
import { IndexComponent } from './components/admin/index/index.component';
import { ShowComponent } from './components/admin/show/show.component';
import { EditComponent } from './components/admin/edit/edit.component';

const routes:Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  { path: 'welcome', pathMatch: 'full', component: WelcomeComponent },
  { path: 'about', pathMatch: 'full', component: AboutComponent },
  { path: 'admin', children: [
    { path: ':path', component: IndexComponent },
    { path: ':path/:id', component: ShowComponent },
    { path: ':path/edit/:id', component: EditComponent },
    { path: ':path/new', component: EditComponent },
  ]},
  { path: 'clients', children:[
    {path: '', component: ClientsComponent},
    {path: ':id', component: ClientComponent},
  ]},
  { path: 'organisations', children:[
    {path: '', component: OrganisationsComponent},
    {path: ':id', component: OrganisationComponent},
  ]}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
