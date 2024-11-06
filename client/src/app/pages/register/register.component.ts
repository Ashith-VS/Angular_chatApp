import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApilistService } from '../../services/apilist.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorObj: { [key: string]: string } = {};

  constructor(private fb: FormBuilder,private registrationService:ApilistService,private router:Router) {
    // Initialize the form with form controls and validators
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  handleSubmit(e: Event) {
    e.preventDefault();
    this.errorObj = {};
    this.handleValidate();
    if (this.registerForm.valid) {
      // console.log("Form Submitted", this.registerForm.value);
      this.registrationService.isRegister(this.registerForm.value).subscribe(res=>{
        
        if(res.status===200){
          this.registerForm.reset();
          this.router.navigate(['/login']);
        }else{
          this.errorObj['global']=res.message||'Registration Failed';
        }
      },
      error=>{
        // Handle error responses like 400 or 500
        this.errorObj['global']=error.message||"An error occurred while registering";
      }
    )
    } else {
      // console.log("Form has validation errors");
      setTimeout(() => {
        const firstErrorElement = document.querySelector(".error")as HTMLElement;
        if (firstErrorElement) {
          firstErrorElement.focus();
        }
      }, 1000);
    }
  }

  handleValidate() {
    Object.keys(this.registerForm.controls).forEach((key) => {
      const controlErrors = this.registerForm.get(key)?.errors;
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

