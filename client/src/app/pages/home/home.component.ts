import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApilistService } from '../../services/apilist.service';
import { chatModel, User, userModel, userSearchModel } from '../../models/user.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule,FormsModule,CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  form : FormGroup;
  messages:any=[]
  currentUser:userModel=new Object as userModel
  searchTerm: string = '';
  searchUsers:User[]=[]
  chats:chatModel[]=[]
  selectedChat:any;
  isDropdownVisible: boolean = false;
  

  constructor(private fb: FormBuilder,private router:Router,private homeService:ApilistService,private socketService:SocketService){
    this.form= this.fb.group({
      message:""
    })
  }

  ngOnInit(): void {

    this.homeService.isCurrrentUser().subscribe((res:any)=>{
      this.currentUser=res.user
    })
    this.homeService.getAllChats().subscribe((res=>{
      this.chats=res.chats
    }))

    this.socketService.getMessages().subscribe((msg)=>{
      console.log("received message: ", msg);
      this.messages.push(msg);
    })

    this.socketService.sendMessage(this.messages)
    // console.log('this.form.value.message: ', this?.form?.value?.message);
 
   
    
  }



handleSubmit(){
  // console.log(this.form.value.message)
  // console.log(this.selectedChat._id)
  const data={
    chatId: this.selectedChat._id,
    content: this.form.value.message
  }
  // console.log('data: ', data);
  this.homeService.sendMessages(data).subscribe(res=>{
// console.log("sendMessages",res)
this.form.get('message')?.setValue('')
  })
  this.fetchAllMessages()
}

handleSearch(e:Event){
  e.preventDefault();
  // console.log("Searching for:", this.searchTerm);
  this.homeService.getUsersBySearch(this.searchTerm).subscribe((res:userSearchModel)=>{
    this.searchUsers=res.users;
  })
}

handleSelectUser(user:any){
  // console.log('user: ', user);
  this.homeService.getAccessChat(user).subscribe(res=>{
    // if(!this.chats.find(ch => ch._id=== res._id)) this.chats.push[res.chat,...this.chats]
    this.selectedChat=res.chat;
    // console.log('this.selectedChat: ', this.selectedChat);
    this.fetchAllMessages()
  })
}

handleSelectChat(user:any){
  // console.log('user444: ', user);
  this.selectedChat=user;
  this.fetchAllMessages()
}

fetchAllMessages(){
  if(!this.selectedChat)return;
  console.log('this.selectedChat: ', this.selectedChat);
  this.homeService.fetchAllMessages(this.selectedChat?._id).subscribe(res=>{
    // console.log("all messages of selected chat: ", res.messages);
    this.messages=res.messages;
    // console.log('this.messages: ', this.messages);
  })

}


getSender(currentuser:any,users:any){
  const user=users.find((user:any)=>user._id !== currentuser._id)
  return  user.username
}


handleLogout(e:Event){
  e.preventDefault();
  localStorage.removeItem('token');
  this.router.navigate(['/login']);
}

showDropdown(){
  this.isDropdownVisible = !this.isDropdownVisible;
  console.log('this.isDropdownVisible: ', this.isDropdownVisible);
}

handleNavigate(route:string):void{
  this.router.navigate([route]);
}
  

}
