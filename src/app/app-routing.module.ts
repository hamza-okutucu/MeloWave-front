import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guard/auth.guard';
import { RoleGuard } from './guard/role.guard';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'home' , component: HomeComponent, pathMatch: 'full'},
  { path: 'home/:param', component: HomeComponent, pathMatch: 'full'},
  { path: 'profile' , component: ProfileComponent, canActivate: [AuthGuard, RoleGuard], pathMatch: 'full'},
  { path: 'profile/:param' , component: ProfileComponent, canActivate: [AuthGuard, RoleGuard], pathMatch: 'full'},
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
