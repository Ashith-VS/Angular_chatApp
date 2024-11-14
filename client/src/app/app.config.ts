import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { firebaseConfig } from './firebase.config';
import { getStorage, provideStorage } from '@angular/fire/storage';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
     provideRouter(routes), provideClientHydration(),
     provideToastr({
    timeOut:10000,
    positionClass:"toast-top-center",
    preventDuplicates:true,
    closeButton:true,
    progressBar:true,
  }),
  provideFirebaseApp(()=>initializeApp(firebaseConfig)),
  provideFirestore(() => getFirestore()),
  provideStorage(() => getStorage())
]
};
