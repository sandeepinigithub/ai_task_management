import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Account } from './account';
import { Login } from './login/login';

const routes: Routes = [
    {
    path: '',
    component: Account,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        component: Login
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountsRoutingModule {}
