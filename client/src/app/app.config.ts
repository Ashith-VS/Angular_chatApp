import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';


export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(),provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(),provideToastr({
    timeOut:10000,
    positionClass:"toast-top-center",
    preventDuplicates:true,
    closeButton:true,
    progressBar:true,
    // progressAnimation:"decreasing"
  })]
};
