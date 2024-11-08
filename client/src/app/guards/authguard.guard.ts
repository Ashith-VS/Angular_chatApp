import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authguardGuard: CanActivateFn = (route, state) => {

  const currentUser = localStorage.getItem('token')
  // console.log('currentUser: ', currentUser);
  const router= inject(Router)
 

  if(currentUser !== null){
    return true;
  }else{
    router.navigateByUrl('login')
    return false;
  }
};
