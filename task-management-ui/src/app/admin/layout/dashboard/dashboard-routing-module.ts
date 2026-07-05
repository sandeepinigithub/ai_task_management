import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './dashboard';
import { CommonDashboard } from './common-dashboard/common-dashboard';

const routes: Routes = [
  {
    path: '',
    component: Dashboard,
    children: [
      {
        path: '',
        component: CommonDashboard
      },
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule { }
