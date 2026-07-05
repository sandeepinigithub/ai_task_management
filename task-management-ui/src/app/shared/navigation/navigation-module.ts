import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Navigation } from './navigation';
import { SidebarModule } from '../sidebar/sidebar-module';
import { HeaderPortalModule } from '../header-portal/header-portal-module';
import { AppNavigationService } from './app-navigation-service';

@NgModule({
  declarations: [Navigation],
  imports: [
    CommonModule,
    RouterModule,
    SidebarModule,
    HeaderPortalModule
  ],
  exports: [Navigation],
  providers: [AppNavigationService]
})
export class NavigationModule { }
