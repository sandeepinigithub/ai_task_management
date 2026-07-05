import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskManagement } from './task-management';
import { Tasks } from './tasks/tasks';
import { TaskForm } from './task-form/task-form';
import { TaskDetails } from './task-details/task-details';

const routes: Routes = [
  {
    path: '',
    component: TaskManagement,
    children: [
      { path: '', redirectTo: 'tasks', pathMatch: 'full' },
      { path: 'tasks',          component: Tasks },
      { path: 'tasks/new',      component: TaskForm },
      { path: 'tasks/:id/edit', component: TaskForm },
      { path: 'tasks/:id',      component: TaskDetails },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TaskManagementRoutingModule { }
