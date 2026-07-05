import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/* PrimeNG Modules */
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { PanelModule } from 'primeng/panel';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MultiSelectModule } from 'primeng/multiselect';
import { CardModule } from 'primeng/card';

import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { BadgeModule } from 'primeng/badge';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ChipModule } from 'primeng/chip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { FieldsetModule } from 'primeng/fieldset';
import { FileUploadModule } from 'primeng/fileupload';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SkeletonModule } from 'primeng/skeleton';
import { SliderModule } from 'primeng/slider';
import { StepsModule } from 'primeng/steps';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TreeModule } from 'primeng/tree';
import { TreeTableModule } from 'primeng/treetable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { TagModule } from 'primeng/tag';

import { MessageService } from 'primeng/api';
import { ValidationMessage } from './validation-message/validation-message';
import { CompWrap } from './comp-wrap/comp-wrap';
import { ShowGridActionDirective } from './directives/show-grid-action.directive';

@NgModule({
  declarations: [
    ValidationMessage,
    CompWrap
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    // PrimeNg
    ButtonModule,
    InputTextModule,
    // DropdownModule,
    // CalendarModule,
    TableModule,
    DialogModule,
    ToastModule,
    TooltipModule,
    PanelModule,
    CheckboxModule,
    RadioButtonModule,
    MultiSelectModule,
    CardModule,
    AccordionModule,
    AutoCompleteModule,
    BadgeModule,
    BreadcrumbModule,
    ChipModule,
    ConfirmDialogModule,
    DividerModule,
    FieldsetModule,
    FileUploadModule,
    InputMaskModule,
    InputNumberModule,
    MenuModule,
    MenubarModule,
    // MessagesModule,
    // OverlayPanelModule,
    ProgressBarModule,
    ProgressSpinnerModule,
    ScrollPanelModule,
    SkeletonModule,
    SliderModule,
    StepsModule,
    // TabMenuModule,
    // TabViewModule,
    TieredMenuModule,
    ToggleButtonModule,
    TreeModule,
    TreeTableModule,
    InputGroupModule,
    InputGroupAddonModule,
    SelectModule,
    MessageModule,
    PaginatorModule,
    ProgressSpinner,
    ToggleSwitch,
    IconFieldModule,
    InputIconModule,
    OverlayBadgeModule,
    TagModule,

    // Directive 
    ShowGridActionDirective
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    // DropdownModule,
    // CalendarModule,
    TableModule,
    DialogModule,
    ToastModule,
    TooltipModule,
    PanelModule,
    CheckboxModule,
    RadioButtonModule,
    MultiSelectModule,
    CardModule,
    AccordionModule,
    AutoCompleteModule,
    BadgeModule,
    BreadcrumbModule,
    ChipModule,
    ConfirmDialogModule,
    DividerModule,
    FieldsetModule,
    FileUploadModule,
    InputMaskModule,
    InputNumberModule,
    MenuModule,
    MenubarModule,
    // MessagesModule,
    // OverlayPanelModule,
    ProgressBarModule,
    ProgressSpinnerModule,
    ScrollPanelModule,
    SkeletonModule,
    SliderModule,
    StepsModule,
    // TabMenuModule,
    // TabViewModule,
    TieredMenuModule,
    ToggleButtonModule,
    TreeModule,
    TreeTableModule,
    InputGroupModule,
    InputGroupAddonModule,
    SelectModule,
    MessageModule,
    PaginatorModule,
    ProgressSpinner,
    ToggleSwitch,
    IconFieldModule,
    InputIconModule,
    OverlayBadgeModule,
    TagModule,

    // Component 
    ValidationMessage,
    CompWrap,

    // Directive 
    ShowGridActionDirective
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

  providers: [MessageService],
})
export class CommonSharedModule { }
