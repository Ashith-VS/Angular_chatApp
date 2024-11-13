import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authguardGuard: CanActivateFn = (route, state) => {

  const platFormId = inject(PLATFORM_ID)
  const router= inject(Router)

   // Check if running in the browser
   if(isPlatformBrowser(platFormId)){
     const currentUser = localStorage.getItem('token')

     if(currentUser !== null){
       return true;
     }else{
       router.navigateByUrl('login')
       return false;
     }
   }else{
      // If not in the browser, prevent activation
      return false;
   }


};
