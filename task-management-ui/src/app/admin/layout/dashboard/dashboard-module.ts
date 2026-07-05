import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing-module';
import { Dashboard } from './dashboard';
import { CommonDashboard } from './common-dashboard/common-dashboard';
import { CommonSharedModule } from '../../../shared/common-shared/common-shared-module';

@NgModule({
  declarations: [Dashboard, CommonDashboard],
  imports: [CommonModule, DashboardRoutingModule, CommonSharedModule],
})
export class DashboardModule {}
