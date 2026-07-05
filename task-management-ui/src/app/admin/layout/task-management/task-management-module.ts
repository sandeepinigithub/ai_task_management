import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TaskManagementRoutingModule } from './task-management-routing-module';
import { TaskManagement } from './task-management';
import { Tasks } from './tasks/tasks';
import { TaskForm } from './task-form/task-form';
import { CommonSharedModule } from '../../../shared/common-shared/common-shared-module';
import { TagModule } from 'primeng/tag';
import { TaskDetails } from './task-details/task-details';

@NgModule({
  declarations: [TaskManagement, Tasks, TaskForm, TaskDetails],
  imports: [CommonModule, TaskManagementRoutingModule, CommonSharedModule, TagModule],
})
export class TaskManagementModule {}
