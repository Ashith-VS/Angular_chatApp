import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProfileModalComponent } from './pages/profile-modal/profile-modal.component';
import { NewGroupModalComponent } from './pages/new-group-modal/new-group-modal.component';

export const routes: Routes = [
    {path:"", redirectTo:"login", pathMatch:"full"},
    {path:"login", component:LoginComponent,title:'Login'},
    {path:"register", component:RegisterComponent,title:'Register'},
    {path:"home", component: HomeComponent,title:'home'},
    {path:"profile", component:ProfileModalComponent,title:'Profile'},
    {path:"new", component:NewGroupModalComponent,title:''},
    {path:"**", redirectTo:"login", pathMatch:"full"},
];
