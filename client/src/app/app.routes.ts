import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { NewGroupModalComponent } from './pages/new-group-modal/new-group-modal.component';
import { authguardGuard } from './guards/authguard.guard';

export const routes: Routes = [
    {path:"", redirectTo:"login", pathMatch:"full"},
    {path:"login", component:LoginComponent,title:'Login'},
    {path:"register", component:RegisterComponent,title:'Register'},
    {path:"home", component: HomeComponent,title:'home' ,canActivate:[authguardGuard]},
    {path:"new", component:NewGroupModalComponent,title:'new_Group',canActivate:[authguardGuard]},
    {path:"**", redirectTo:"login", pathMatch:"full"},
];
