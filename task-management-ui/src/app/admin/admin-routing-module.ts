import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Admin } from './admin';

const routes: Routes = [
  {
    path: '',
    component: Admin,
    children: [
      {
        path: '',
        loadChildren: () => import('./layout/layout-module').then((m) => m.LayoutModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
