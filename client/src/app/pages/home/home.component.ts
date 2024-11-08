import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApilistService } from '../../services/apilist.service';
import { chatModel, User, userModel, userSearchModel } from '../../models/user.model';
import { Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule,FormsModule,CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollableDiv') scrollableDiv !: ElementRef;

  
  form : FormGroup;
  messages:any=[]
  currentUser:userModel=new Object as userModel
  searchTerm: string = '';
  searchUsers:User[]=[]
  chats:chatModel[]=[]
  selectedChat:any;
  isDropdownVisible: boolean = false;
  openModal: boolean = false;
  groupChatName:string=''
  search:string=''
  searchResults:any=[];
  openUserModal:boolean = false
  isProfileModalVisible = false;
  editing = false;
  changePassword:boolean = false
  password:string='';
  newPassword:string='';
  confirmPassword:string='';
 


  constructor(private fb: FormBuilder,private router:Router,private homeService:ApilistService,private socketService:SocketService,private cdr: ChangeDetectorRef,private location: Location){
    this.form= this.fb.group({
      message:""
    })
  }

  ngOnInit(): void {
    // window.scrollTo({ top: 1000, behavior: 'smooth' });
    this.homeService.isCurrrentUser().subscribe((res:any)=>{
      this.currentUser=res.user
      this.socketService.sendCurrentUser(this.currentUser)
    })
    this.fetchAllChats()
    // this.homeService.getAllChats().subscribe((res=>{
    //   this.chats=res.chats
    // }))

    this.socketService.getMessages().subscribe((msg)=>{
      // console.log("received message: ", msg);
      this.messages.push(msg)
      this.cdr.detectChanges();
      // console.log('this.messages: ', this.messages);
    })
  
   

    // console.log('this.form.value.message: ', this?.form?.value?.message);
  }

  fetchAllChats(): void {
    this.homeService.getAllChats().subscribe((res)=>{
      this.chats=res.chats
    })
  }

  scrollToBottom(): void {
    if (this.scrollableDiv) {
      const element = this.scrollableDiv.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

ngAfterViewChecked(): void {
    this.scrollToBottom()
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
console.log("sendMessages",res.message)
this.socketService.sendMessage(res.message)
this.messages=[...this.messages,res.message]
this.form.get('message')?.setValue('')
  })
  // this.fetchAllMessages()
}

handleSearch(e:Event){
  e.preventDefault();
  // console.log("Searching for:", this.searchTerm);
  this.homeService.getUsersBySearch(this.searchTerm).subscribe((res:userSearchModel)=>{
    this.searchUsers=res.users;
    console.log('res.users: ', res.users);

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
  this.socketService.joinRoom(this.selectedChat._id)
}


getSender(currentuser:any,users:any){
  const user=users?.find((user:any)=>user?._id !== currentuser?._id)
  return  user?.username
}

getSenderfullDetail(currentuser:any,users:any){
  const user=users.find((user:any)=>user._id !== currentuser._id)
  return {
    name:user.username,
    email:user.email,
    avatar:user.avatar
  }
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

handleNavigateBack(): void {
  this.selectedChat=null;

  console.log("back", this.selectedChat);
  // this.location.back();
}

handleOpenModal(){
  this.openModal =!this.openModal;
  // console.log('this.openModal: ', this.openModal);
}

handleCloseModal(){
this.openModal=false;
}

handleSearchUser(){
  if(!this.search)return
  this.homeService.getUsersBySearch(this.search).subscribe(res=>{
    // console.log('res: ', res.users);
    this.searchResults=res.users;
  })
}

handleAddUser(user:any){
  if(this.selectedChat.users.find((u:any)=>u._id === user._id)){
    alert('User already added');
    return
  }
  if(this.selectedChat.groupAdmin._id !== this.currentUser._id){
    alert('Only group admin can add users');
    return
  }
  const data={
    chatId: this.selectedChat._id,
    userId: user._id
  }
  this.homeService.addUserToGroupChat(data).subscribe(res=>{
    // console.log('addUserToGroupChat: ', res.chat);
    this.selectedChat=res.chat;
    // this.fetchAllMessages()
  })

}


handleRename(){
  if(!this.groupChatName)return
  const data={
    chatId: this.selectedChat._id,
    chatName: this.groupChatName
  }
  this.homeService.renameGroupChat(data).subscribe(res=>{
    // console.log('renameGroupChat: ', res.chat);
    this.selectedChat=res.chat;
    this.fetchAllMessages()
    this.groupChatName=''
  })
}

handleRemove(user:any){
  console.log('user: ', user);
  if(this.selectedChat?.groupAdmin?._id !== this.currentUser._id && user._id !== this.currentUser._id){
    alert('Only group admin can remove users');
    return
  }
  const data={
    chatId: this.selectedChat._id,
    userId: user._id,
  }
  console.log('data: ', data);
  this.homeService.leaveGroupChat(data).subscribe(res=>{
    console.log('leaveGroupChat: ', res.chat);

    // this.selectedChat=res.chat;
    user?._id === this.currentUser._id ?this.selectedChat={}:this.selectedChat(res.chat)
    // console.log('this.selectedChat: ', this.selectedChat);
    this.selectedChat= null
    this.openModal=false
    this.fetchAllChats()
  })
}



handleShowUserModal(){
  this.openUserModal =!this.openUserModal;
}

handleCloseUserModal(){
  this.openUserModal = false;
}

handleProfileShow(){
  this.isProfileModalVisible =!this.isProfileModalVisible;
}


closeProfileModal() {
  this.isProfileModalVisible = false;
  this.editing = false;
}

startEditing() {
  this.editing = true;
}

cancelEditing() {
  this.editing = false;
}

handleAvatar(e:Event):void{
  const file=(e.target as HTMLInputElement).files?.[0];
  if(file){
    const reader = new FileReader();
    reader.onload = (e:any) => {
      this.currentUser.avatar = e.target.result;
      console.log('this.currentUser.avatar: ', this.currentUser.avatar);
    };
    reader.readAsDataURL(file);
  }
}

handleUpdateProfile() {
  const data={
    username: this.currentUser.username,
    email:this.currentUser.email,
    about: this.currentUser.about,
    avatar: this.currentUser.avatar,
  }
  // console.log('data: ', data);

  this.homeService.isUpdateUser(data).subscribe(res=>{
    // console.log(res,"register");
    this.editing = false;
    this.closeProfileModal();
  })
}

handleChangePasswordToggle(){
  this.changePassword=!this.changePassword
}

handlePasswordChange(){

}
  



}
