import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Layout } from './layout';

const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard-module').then((m) => m.DashboardModule),
      },
      {
        path: 'task-management',
        loadChildren: () => import('./task-management/task-management-module').then((m) => m.TaskManagementModule)
      },
      {
        path: 'user-management',
        loadChildren: () => import('./user-management/user-management-module').then((m) => m.UserManagementModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutRoutingModule { }
