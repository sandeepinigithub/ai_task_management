import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';

import { UserManagementRoutingModule } from './user-management-routing-module';
import { CommonSharedModule } from '../../../shared/common-shared/common-shared-module';
import { Users } from './users/users';
import { UserForm } from './user-form/user-form';
import { UserDetails } from './user-details/user-details';
import { UserManagement } from './user-management';

@NgModule({
  declarations: [UserManagement, Users, UserForm, UserDetails],
  imports: [CommonModule, UserManagementRoutingModule, CommonSharedModule, TagModule],
})
export class UserManagementModule {}
