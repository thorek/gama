import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { AboutComponent } from './components/about/about.component';
import { LoginComponent } from './components/login/login.component';
import { AdminRoutingModule } from 'gama-admin-ui';

@NgModule({ imports: [AdminRoutingModule] } )
export class AdminRoutingModuleWrapper {}


const routes:Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  { path: 'login', pathMatch: 'full', component: LoginComponent },
  { path: 'welcome', pathMatch: 'full', component: WelcomeComponent },
  { path: 'about', pathMatch: 'full', component: AboutComponent },
  { path: 'admin', loadChildren: 'AdminRoutingModuleWrapper' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' } )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
