import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Users } from './users/users';
import { UserForm } from './user-form/user-form';
import { UserDetails } from './user-details/user-details';
import { UserManagement } from './user-management';

const routes: Routes = [
  {
    path: '',
    component: UserManagement,
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', component: Users },
      { path: 'users/new', component: UserForm },
      { path: 'users/:id/edit', component: UserForm },
      { path: 'users/:id', component: UserDetails },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserManagementRoutingModule { }
