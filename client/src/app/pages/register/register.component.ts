import { Component, OnInit } from '@angular/core';
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
export class RegisterComponent implements OnInit{
  registerForm: FormGroup;
  errorObj: { [key: string]: string } = {};
  defaultAvatarIcon = './assets/icons/avatar.webp';
  avatar: File | null = null;
  showModal: boolean = false;

  constructor(private fb: FormBuilder,private registrationService:ApilistService,private router:Router) {
    // Initialize the form with form controls and validators
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
    });
  }

  ngOnInit(): void {
    this.handleClearError();
  }

  handleAvatar(e:Event):void{
    const file=(e.target as HTMLInputElement).files?.[0];
    if(file){
      const reader = new FileReader();
      reader.onload = (e:any) => {
        this.avatar = e.target.result;
        console.log('this.avatar4: ', this.avatar);
      };
      reader.readAsDataURL(file);
    }
  }

  handleClearError(){
Object.keys(this.registerForm.controls).forEach((key)=>{
  this.registerForm.get(key)?.valueChanges.subscribe(()=>{
    if(this.errorObj[key]){
      delete this.errorObj[key];
    }
  })
})
  }

  handleSubmit(e: Event) {
    e.preventDefault();
    this.errorObj = {};
    this.handleValidate();
    console.log('this.registerForm.valid: ', this.registerForm.valid);
    if (this.registerForm.valid) {
      const formObject: any = { ...this.registerForm.value };
 // Add avatar data if present
 if (this.avatar) {
  formObject['avatar'] = this.avatar;
}

// console.log("Form Payload:", formObject);
      this.registrationService.isRegister(formObject).subscribe(res=>{
        if(res.status===200){
          this.registerForm.reset();
          // create a successful registration modal
       this.showModal=true;
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
        }else if (controlErrors['pattern'] && key === 'password') {
          this.errorObj[key] = `Password must be at least 8 characters long, with at least one uppercase letter and one special character.`;
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

  handleNavigate(data:string){
    this.router.navigate([`/${data}`]);
  }

  

  


}

