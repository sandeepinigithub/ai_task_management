import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountsRoutingModule } from './accounts-routing-module';
import { Login } from './login/login';
import { Account } from './account';
import { CommonSharedModule } from '../shared/common-shared/common-shared-module';
import { Register } from './register/register';

@NgModule({
  declarations: [Login, Account, Register],
  imports: [CommonModule, AccountsRoutingModule, CommonSharedModule],
})
export class AccountsModule { }
