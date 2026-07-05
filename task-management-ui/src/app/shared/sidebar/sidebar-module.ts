import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Sidebar } from './sidebar';
import { CommonSharedModule } from '../common-shared/common-shared-module';

@NgModule({
  declarations: [Sidebar],
  imports: [
    CommonModule,
    RouterModule,
    CommonSharedModule
  ],
  exports: [Sidebar],
})
export class SidebarModule { }
