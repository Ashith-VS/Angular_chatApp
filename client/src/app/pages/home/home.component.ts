import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApilistService } from '../../services/apilist.service';
import { chatModel, User, userModel, userSearchModel } from '../../models/user.model';
import { Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { SocketService } from '../../services/socket.service';
import { ToastrService } from 'ngx-toastr';
import { isEmpty } from 'lodash';


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
  searchPerformed: boolean = false;
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
  changePasswordError:{[key:string]:string} = {}
  changePasswordSuccessModal:boolean = false;
  logoutModal:boolean = false;
  onlineUsers :any=[]; 


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
    
    this.socketService.getMessages().subscribe((msg)=>{
      this.fetchAllChats()
      // console.log("received message: ", msg);
      this.messages.push(msg)
      this.cdr.detectChanges();
      // console.log('this.messages: ', this.messages);
    })


    this.socketService.userStatus().subscribe((res:any)=>{
      console.log("received user status: ", res);
      if (res.status === 'online') {
        this.onlineUsers.push(res.userId);  
      } else if (res.status === 'offline') {
        this.onlineUsers.pop(res.userId);  
      }
      this.cdr.detectChanges();  // Ensure UI updates with new status
      console.log('this.onlineUsers: ', this.onlineUsers);
    })
  }

   // Check if the user is online
   isUserOnline(userId: string): boolean {
    return this.onlineUsers.includes(userId);  // Check if the user is in the onlineUsers set
  }

  fetchAllChats(): void {
    this.homeService.getAllChats().subscribe((res)=>{
      this.chats=res.chats
      this.cdr.detectChanges();
      // console.log('res.chats: ', res.chats);
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
console.log('this.messages: ', this.messages);
this.form.get('message')?.setValue('')
this.fetchAllChats()

})
// this.fetchAllMessages()
}

handleSearch(e:Event){
  e.preventDefault();
  this.homeService.getUsersBySearch(this.searchTerm).subscribe((res:userSearchModel)=>{
    this.searchUsers=res.users;
    this.searchPerformed=true;
  })
}

handleSelectUser(user:any){
  this.homeService.getAccessChat(user).subscribe(res=>{
    this.selectedChat=res.chat;
    this.searchUsers=[]
    this.searchPerformed=false
    this.fetchAllChats()
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
    // this.fetchAllChats()
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
    id:user._id,
    name:user.username,
    email:user.email,
    avatar:user.avatar,
    status:user.status
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

getAllChatUsers(){
  if(!this.selectedChat) return;
  const value = this.selectedChat.users.filter((user: any) =>
    !this.selectedChat.groupAdmin.some((admin: any) => admin._id === user._id))
  this.filteredUsers=value;
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
    this.fetchAllMessages()
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
  // this.selectedChat=null
  if(user._id === this.selectedChat.groupCreator){
    this.toast.info('Creator cant be removed')
    return
  }
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
  console.log('data: ', data);
  this.homeService.leaveGroupChat(data).subscribe(res=>{
    // console.log('leaveGroupChat: ', res.chat);

    this.selectedChat=res.chat;
    // user?._id === this.currentUser._id ?this.selectedChat={}:this.selectedChat(res.chat)
    // console.log('this.selectedChat: ', this.selectedChat);
    // this.selectedChat= null
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

handleChangePasswordValidation(){
  this.changePasswordError = {};
  if (!this.password) {
    this.changePasswordError['password'] = 'Current password is required';
  }
  if (!this.newPassword) {
    this.changePasswordError['newPassword'] = 'New password is required';
  }
  if (!this.confirmPassword) {
    this.changePasswordError['confirmPassword'] = 'Please confirm the new password';
  }
  // Additional validation for new password strength
  const pattern = /^(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (this.newPassword && !pattern.test(this.newPassword)) {
    this.changePasswordError['newPassword'] = 'Password must be at least 8 characters, contain at least one uppercase letter, and include one special character';
  }

  // Check if new password matches confirmation password
  if (this.newPassword && this.confirmPassword && this.newPassword !== this.confirmPassword) {
    this.changePasswordError['confirmPassword'] = 'Passwords do not match';
  }
  return this.changePasswordError
}

handlePasswordChange(e:Event){
  e.preventDefault();
  this.handleChangePasswordValidation();
  if(isEmpty(this.changePasswordError)){
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
        // show a success modal
        this.changePasswordSuccessModal=true
        // this.changePassword=false;
      },
      error:(err)=>{
        const errorMessage = err?.message || 'An error occurred while changing the password';
        this.toast.error(errorMessage);
      }
    })
  }else{
    setTimeout(() => {
      const firstErrorElement = document.querySelector(".error")as HTMLElement;
      if (firstErrorElement) {
        firstErrorElement.focus();
      }
    }, 1000);
   
  }

}
handleClosePasswordChangeModal(){
  this.changePassword=false;
  this.changePasswordSuccessModal=false;
}

changePasswordArray(){
  return Object.keys(this.changePasswordError)
}

handleChangePasswordClear(data:string){
  this.changePasswordError[data] = '';
}

focusInput(id:string){
  const inputElement = document.getElementById(id);
  if(inputElement){
    inputElement.focus();
  }
}

handleAddGroupAdmins(user:any){
  const data={
    chatId: this.selectedChat._id,
    userIds: user._id
  }
  this.homeService.addAdminsToGroupChat(data).subscribe(res=>{
    this.selectedChat=res.chat;
    this.getAllChatUsers()
  })
}

handleRemoveGroupAdmins(user:any){
  if(user._id === this.selectedChat.groupCreator){
    this.toast.info('Creator cant be removed as admin')
    return
  }
  
  const data={
    chatId: this.selectedChat._id,
    userId: user._id
  }
  this.homeService.removeAdminFromGroupChat(data).subscribe(res=>{
    this.selectedChat=res.chat;
    this.getAllChatUsers()
  })
}

handleDeleteAccount(){
  if(!this.currentUser){
     this.toast.error('User not found');
     return
  }
  this.logoutModal=true
}

handleCloseLogout(){
  this.logoutModal=false;
}

handleConfirmDeleteAccount(){
  this.homeService.deleteAccount().subscribe(res=>{
    this.toast.success('User deleted successfully');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  })

}

  



}
