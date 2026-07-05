import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

import { providePrimeNG } from 'primeng/config';
import MyPreset from './../assets/scss/mypreset';

import { authInterceptor } from './accounts/auth/interceptor/auth-interceptor';
import { errorInterceptor } from './accounts/auth/interceptor/error-interceptor';

@NgModule({
  declarations: [App],
  imports: [BrowserModule, AppRoutingModule],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: { darkModeSelector: 'none' },
      },
    }),
  ],
  bootstrap: [App],
})
export class AppModule { }
