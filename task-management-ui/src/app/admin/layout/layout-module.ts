import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LayoutRoutingModule } from './layout-routing-module';
import { Layout } from './layout';
import { NavigationModule } from '../../shared/navigation/navigation-module';

@NgModule({
  declarations: [Layout],
  imports: [
    CommonModule,
    LayoutRoutingModule,
    NavigationModule
  ],
})
export class LayoutModule { }
