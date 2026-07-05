import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderPortal } from './header-portal';
import { CommonSharedModule } from '../common-shared/common-shared-module';

@NgModule({
  declarations: [HeaderPortal],
  imports: [
    CommonModule,
    CommonSharedModule
  ],
  exports: [HeaderPortal],
})
export class HeaderPortalModule { }
