import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApilistService } from '../../services/apilist.service';
import { chatModel, User, userModel, userSearchModel } from '../../models/user.model';
import { Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { SocketService } from '../../services/socket.service';
import { ToastrService } from 'ngx-toastr';

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
  AddGroupAdmins:string=''
  search:string=''
  searchResults:any=[];
  openUserModal:boolean = false
  isProfileModalVisible = false;
  editing = false;
  changePassword:boolean = false
  password:string='';
  newPassword:string='';
  confirmPassword:string='';
  filteredUsers:any=[]


  constructor(private fb: FormBuilder,private router:Router,private homeService:ApilistService,private socketService:SocketService,private cdr: ChangeDetectorRef,private location: Location,private toast:ToastrService){
    this.form= this.fb.group({
      message:""
    })
  }

  ngOnInit(): void {
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
  const data={
    chatId: this.selectedChat._id,
    content: this.form.value.message
  }

  this.homeService.sendMessages(data).subscribe(res=>{
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
  })
}

handleSelectUser(user:any){
  this.homeService.getAccessChat(user).subscribe(res=>{
    // if(!this.chats.find(ch => ch._id=== res._id)) this.chats.push[res.chat,...this.chats]
    this.selectedChat=res.chat;
    this.fetchAllMessages()
  })
}

handleSelectChat(user:any){
  this.selectedChat=user;
  console.log('this.selectedChat: ', this.selectedChat);
  this.fetchAllMessages()
}

fetchAllMessages(){
  if(!this.selectedChat)return;
  this.homeService.fetchAllMessages(this.selectedChat?._id).subscribe(res=>{
    this.messages=res.messages;
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

getAllAdmins(user:any){
user.map((adm:any)=>{
    return adm.avatar
  })
}

isGroupAdmin(selectedChat: any, currentUser: any){
  return selectedChat.groupAdmin.some((admin: any) => admin._id === currentUser._id);
}


getOtherUserAvatar(currentUser: any, users: any[]): string {
  const otherUser = users.find(user => user._id !== currentUser._id);
  return otherUser?.avatar 
}

handleLogout(e:Event){
  e.preventDefault();
  localStorage.removeItem('token');
  this.router.navigate(['/login']);
}

showDropdown(){
  this.isDropdownVisible = !this.isDropdownVisible;
  // console.log('this.isDropdownVisible: ', this.isDropdownVisible);
}

handleNavigate(route:string):void{
  this.router.navigate([route]);
}

handleNavigateBack(): void {
  this.selectedChat=null;
  // this.location.back();
}

handleOpenModal(){
  this.openModal =!this.openModal;
  if (this.openModal && this.selectedChat) {
    // Filter users who are in the groupAdmin array
    const value = this.selectedChat.users.filter((user: any) =>
      !this.selectedChat.groupAdmin.some((admin: any) => admin._id === user._id)
  );
  // console.log('value: ', value);
  this.filteredUsers=value;
  // console.log('this.filteredUsers: ', this.filteredUsers);
  }
}

handleCloseModal(){
this.openModal=false;
}

handleSearchUser(){
  if(!this.search)return
  this.homeService.getUsersBySearch(this.search).subscribe(res=>{
    this.searchResults=res.users;
  })
}

handleAddUser(user:any){
  if(this.selectedChat.users.find((u:any)=>u._id === user._id)){
    alert('User already added');
    return
  }
  // if(this.selectedChat.groupAdmin._id !== this.currentUser._id){
  //   alert('Only group admin can add users');
  //   return
  // }
  if(this.selectedChat.groupAdmin.some((admin:any)=>admin.id === this.currentUser._id )){
    alert('Only group admin can add users');
    return
  }
  const data={
    chatId: this.selectedChat._id,
    userId: user._id
  }
  this.homeService.addUserToGroupChat(data).subscribe(res=>{
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
    this.selectedChat=res.chat;
    this.fetchAllMessages()
    this.groupChatName=''
  })
}

handleRemove(user:any){
  // if(this.selectedChat?.groupAdmin?._id !== this.currentUser._id && user._id !== this.currentUser._id){
  //   alert('Only group admin can remove users');
  //   return
  // }
  if(this.selectedChat.groupAdmin.some((admin:any)=>admin.id === this.currentUser._id )){
    alert('Only group admin can remove users');
    return
  }
  const data={
    chatId: this.selectedChat._id,
    userId: user._id,
  }
  // console.log('data: ', data);
  this.homeService.leaveGroupChat(data).subscribe(res=>{
    // console.log('leaveGroupChat: ', res.chat);

    // // this.selectedChat=res.chat;
    // user?._id === this.currentUser._id ?this.selectedChat={}:this.selectedChat(res.chat)
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
      // console.log('this.currentUser.avatar: ', this.currentUser.avatar);
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
  this.homeService.isUpdateUser(data).subscribe(res=>{
    this.editing = false;
    this.closeProfileModal();
  })
}

handleChangePasswordToggle(){
  this.changePassword=!this.changePassword
  this.isProfileModalVisible=false
  
}

handlePasswordChange(e:Event){
  e.preventDefault();
  if(!this.password ||!this.newPassword ||!this.confirmPassword){
    this.toast.error('All fields are required')
    return
  }
  const pattern = /^(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!pattern.test(this.newPassword)) {
    this.toast.error('Password must be at least 8 characters long, contain at least one uppercase letter, and include one special character.');
    return;
  }

  if(this.newPassword !== this.confirmPassword){
    this.toast.error('Passwords do not match');
    return
  }
  const data={
    currentPassword: this.password,
    newPassword: this.newPassword
  }
  this.homeService.isChangePassword(data).subscribe({
    next:(res)=>{
      this.toast.success(res?.message ||'Password changed successfully');
      this.password='';
      this.newPassword='';
      this.confirmPassword='';
      this.changePassword=false;
    },
    error:(err)=>{
      const errorMessage = err?.message || 'An error occurred while changing the password';
      this.toast.error(errorMessage);
    }
  })

}

handleAddGroupAdmins(user:any){
  const data={
    chatId: this.selectedChat._id,
    userIds: user._id
  }
  this.homeService.addAdminsToGroupChat(data).subscribe(res=>{
    this.selectedChat=res.chat;
  })
}

handleRemoveGroupAdmins(user:any){
  const data={
    chatId: this.selectedChat._id,
    userId: user._id
  }
  console.log('data: ', data);
  // this.homeService.removeAdminFromGroupChat(data).subscribe(res=>{
  //   this.selectedChat=res.chat;
  // })
}
  



}
