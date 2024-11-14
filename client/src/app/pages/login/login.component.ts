import { routes } from './../../app.routes';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ApilistService } from '../../services/apilist.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule,RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorObj: { [key: string]: string } = {};

  constructor(private fb:FormBuilder, private loginService:ApilistService,private router:Router) { 
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.handleClearError();
  }

  handleClearError(){
Object.keys(this.loginForm.controls).forEach((key)=>{
  this.loginForm.get(key)?.valueChanges.subscribe(()=>{
    if(this.errorObj[key]){
      delete this.errorObj[key];
    }
  })
})
  }

  handleSubmit(e:Event){
    e.preventDefault();
    this.errorObj={}
    this.handleValidate()
    // console.log('this.errorObj: ', this.errorObj);

    if(this.loginForm.valid){
      // console.log(this.loginForm.value);
      this.loginService.islogin(this.loginForm.value).subscribe(res=>{
        // console.log(res);
        if(res.status===200){
          localStorage.setItem('token', res.token);
          this.loginForm.reset();
          this.router.navigate(['/home']);
        }else{
          this.errorObj['general'] = res.message;
        }
      },
    (error) => {
        // Handle error responses like 400 or 500
        this.errorObj['general'] = error.message || 'An error occurred during login';
    }
  )
    }else{
      setTimeout(() => {
        const firstErrorElement = document.querySelector(".error")as HTMLElement;
        if (firstErrorElement) {
          firstErrorElement.focus();
        }
      }, 1000);
    }

  }

  handleValidate(){
    Object.keys(this.loginForm.controls).forEach((key) => {
      const controlErrors = this.loginForm.get(key)?.errors;
      if (controlErrors) {
        if (controlErrors['required']) {
          this.errorObj[key] = `${key} is required`;
        } else if (controlErrors['email']) {
          this.errorObj[key] = `Invalid email format`;
        } else if (controlErrors['minlength']) {
          this.errorObj[key] = `${key} should be at least ${controlErrors['minlength'].requiredLength} characters`;
        }
      }
    });
    return this.errorObj;
  }

  errorObjArr(){
    return Object.keys(this.errorObj)
  }

  focusInput(id:string){
    const inputElement = document.getElementById(id);
    if(inputElement){
      inputElement.focus();
    }
  }


}
