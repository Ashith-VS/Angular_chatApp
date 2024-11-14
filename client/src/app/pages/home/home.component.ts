import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, HostListener, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApilistService } from '../../services/apilist.service';
import { chatModel, User, userModel, userSearchModel } from '../../models/user.model';
import { Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { SocketService } from '../../services/socket.service';
import { ToastrService } from 'ngx-toastr';
import { isEmpty } from 'lodash';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { getDownloadURL, ref, uploadBytesResumable, Storage } from '@angular/fire/storage';
import { Observable } from 'rxjs';

interface Item {
  name: string;
  fileUrl?: string; // URL of the uploaded file
}
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule,FormsModule,CommonModule,PickerComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})


export class HomeComponent implements OnInit, AfterViewChecked {
  @ViewChild('dropdownContainer') dropdownContainer!:ElementRef;
  @ViewChild('scrollableDiv') scrollableDiv !: ElementRef;
  @ViewChild('fileInput') fileInput: ElementRef| null = null; 

  
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
  emojiToggle:boolean = false
  logoutSuccessModal:boolean=false
  uploadedFileURL: string=""
  item$: Observable<Item[]>;
  isImageModalOpen:boolean = false
  selectedImageUrl: string | null = null;
  isRecording = false; 
  mediaRecorder:MediaRecorder | null = null; // Store the MediaRecorder instance
  audioChunks: Blob[] = []; // Store audio chunks for recording
  audioUrl: string = '';
  isdropdownFileToggle: boolean = false;
  fileAcceptType: string = 'image/*,video/*';


  constructor(private fb: FormBuilder,private router:Router,private homeService:ApilistService,private socketService:SocketService,private cdr: ChangeDetectorRef,private location: Location,private toast:ToastrService,private firestore:Firestore,private storage:Storage){
    this.form= this.fb.group({
      message:""
    })
    const itemsCollection = collection(firestore, 'items');
    this.item$ = collectionData(itemsCollection) as Observable<Item[]>;
  }

    // Detect clicks outside the dropdown
  @HostListener('document:click',['$event.target'])
  public onClick(targetElement:HTMLElement):void{
    const clickedInside = this.dropdownContainer.nativeElement.contains(targetElement);
    if(!clickedInside&& this.isDropdownVisible){
      this.isDropdownVisible=false
    }
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
      this.isUserOnline(res);
      // console.log("received user status: ", res);
        this.onlineUsers.push(...res);  
      this.cdr.detectChanges();  // Ensure UI updates with new status
    })
  }

   // Check if the user is online
   isUserOnline(userId: string): boolean {
    //  console.log('this.onlineUsers.includes(userId): ', this.onlineUsers.includes(userId));
    return this.onlineUsers.includes(userId);  // Check if the user is in the onlineUsers set
  }

  fetchAllChats(): void {
    this.homeService.getAllChats().subscribe((res)=>{
      this.chats=res.chats
      console.log('this.chats: ', this.chats);
      this.cdr.detectChanges();
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
this.fetchAllChats()
})
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
  // console.log('this.selectedChat: ', this.selectedChat);
  this.fetchAllMessages()
}

fetchAllMessages(){
  if(!this.selectedChat)return;
  this.homeService.fetchAllMessages(this.selectedChat?._id).subscribe(res=>{
    this.messages=res.messages;
    // console.log(' this.messages: ',  this.messages);
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
    this.fetchAllChats()
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

handleGroupAvatar(e:Event):void{
  const file=(e.target as HTMLInputElement).files?.[0];
  if(file){
    const reader = new FileReader();
    reader.onload = (e:any) => {
      this.selectedChat.groupImage = e.target.result;
      // console.log('this.selectedChat.groupImage: ', this.selectedChat.groupImage);
      if(this.selectedChat.groupImage){
        const data={
          chatId: this.selectedChat._id,
          groupImage: this.selectedChat.groupImage,
        }
        this.homeService.updateGroupImage(data).subscribe(res=>{
          // console.log('updateGroupImage: ', res.chat);
        })
      }
      // this.currentUser.avatar = e.target.result;
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
    // show logout success modal
    this.logoutSuccessModal=true;
    // this.router.navigate(['/login']);
  })

}

handleEmojiToggle(){
  this.emojiToggle=!this.emojiToggle;
}

addEmoji(e:any){
  // console.log('e: ', e.emoji);
  const emoji = e.emoji.native; // Emoji character
  this.form.get('message')?.setValue(this.form.value.message + emoji)
  this.emojiToggle=false;
}

openFileDialog(type: string) {
  if (this.fileInput && type === 'gallery' ) {
    this.fileAcceptType = 'image/*,video/*'
  this.fileInput.nativeElement.click(); // Programmatically click the file input
  }else if(this.fileInput && type === 'document'){
    this.fileAcceptType = ''; // Accept all file types for documents
    this.fileInput.nativeElement.click();
  }
}

handleFileChange(e:Event,type:string){
//   const file=(e.target as HTMLInputElement).files?.[0];
//   if (file ) {
//     this.isdropdownFileToggle=false; 
//     const filePath = `uploadsAngular/${file.name}`;
//     const storageRef = ref(this.storage, filePath);

//      // Upload the file
//      const uploadTask = uploadBytesResumable(storageRef, file);

//     uploadTask.on(
//       'state_changed',
//       (snapshot) => {
//         // Handle progress
//         const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//         console.log(`Upload is ${progress}% done`);
//       },
//       (error) => {
//         console.error('File upload failed:', error);
//       },
//       async() => {
//            // On successful upload, get the file URL
//            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
//           //  console.log('downloadURL: ', downloadURL);
//            const data={
//             chatId: this.selectedChat._id,
//             attachments :[{
//               url: downloadURL,
//               fileType: type === '' ? 'document' : file.type.split('/')[0], // E.g., 'image', 'video'
//               fileName: file.name
//             }]
//            }
//         this.homeService.uploadAttachments(data).subscribe(res=>{
//           // console.log('res: ', res);
//           this.socketService.sendMessage(res.message)
// this.messages=[...this.messages,res.message]
// this.form.get('message')?.setValue('')
// this.fetchAllChats()
//         })

//       }
//     );
//   }


const files = (e.target as HTMLInputElement).files;
  
  if (files && files.length > 0) {
    this.isdropdownFileToggle = false; 
    
    // Create an array to store the file upload promises
    const uploadPromises:any = [];

    // Loop through all files and upload each one
    Array.from(files).forEach((file) => {
      const filePath = `uploadsAngular/${file.name}`;
      const storageRef = ref(this.storage, filePath);

      // Create the file upload promise
      const uploadTask = uploadBytesResumable(storageRef, file);
      const uploadPromise = new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Handle progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload is ${progress}% done`);
          },
          (error) => {
            reject(error); // Reject the promise if there's an error
            console.error('File upload failed:', error);
          },
          async () => {
            // On successful upload, get the file URL
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (error) {
              reject(error);
            }
          }
        );
      });

      // Push the promise to the array
      uploadPromises.push(uploadPromise);
    });

    // Wait for all files to be uploaded
    Promise.all(uploadPromises)
      .then((downloadURLs) => {
        // After all uploads are complete, prepare data to send
        const attachments = downloadURLs.map((url, index) => ({
          url: url,
          fileType: type === '' ? 'document' : files[index].type.split('/')[0], // E.g., 'image', 'video'
          fileName: files[index].name
        }));

        const data = {
          chatId: this.selectedChat._id,
          attachments: attachments
        };

        // Call your service to upload the attachments
        this.homeService.uploadAttachments(data).subscribe((res) => {
          // Handle the response, e.g., updating messages
          this.socketService.sendMessage(res.message);
          this.messages = [...this.messages, res.message];
          this.form.get('message')?.setValue('');
          this.fetchAllChats();
        });
      })
      .catch((error) => {
        console.error('Error uploading files:', error);
      });
  }

}


openImageModal(imageUrl: string): void {
  this.selectedImageUrl = imageUrl;
  this.isImageModalOpen = true;
}

closeImageModal(): void {
  this.isImageModalOpen = false;
  this.selectedImageUrl = null;
}


handleMic(){
  if(this.isRecording){
    this.stopRecording();
  }else{
    this.startRecording();
  }
}


startRecording() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = []; // Empty the array before starting the recording

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        } else {
          console.log('No data available in event');
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        // this.audioUrl = URL.createObjectURL(audioBlob);  // Create URL for the recorded audio
        // console.log('Recording stopped. Audio URL: ', this.audioUrl);
        this.uploadAudioToFirebase(audioBlob);
      };

      this.mediaRecorder.start();
      this.isRecording = true; // Mark recording as in progress
      console.log('Recording started...');
    }).catch((error) => {
      console.error('Error accessing microphone: ', error);
    });
  } else {
    console.error('MediaDevices or getUserMedia not supported');
  }
}

uploadAudioToFirebase(audioBlob: Blob) {
  const timestamp = new Date().getTime();
  const fileName = `audio_${timestamp}.wav`;
  const fileType = audioBlob.type || 'audio/wav'; 

  const audioRef = ref(this.storage, `audio/${timestamp}.wav`);
  const uploadTask = uploadBytesResumable(audioRef, audioBlob);

  uploadTask.on('state_changed', 
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log(`Upload is ${progress}% done`);
      // Track upload progress here (optional)
    }, 
    (error) => {
      console.error('Error uploading audio:', error);
    }, 
    () => {
      // Get download URL when the upload is complete
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        // console.log('downloadURL: ', downloadURL);
        const data={
          chatId: this.selectedChat._id,
          attachments:[{
            url: downloadURL,
            fileType: fileType.split('/')[0],
            fileName:fileName,
          }]
        }
         this.homeService.uploadAttachments(data).subscribe(res=>{
    // console.log('res: ', res);
    this.socketService.sendMessage(res.message)
    this.messages=[...this.messages,res.message]
this.form.get('message')?.setValue('')
this.fetchAllChats()
  })
       
      });
    });
}


stopRecording(){
  if (this.mediaRecorder) {
    this.mediaRecorder.stop(); // Stop the recorder
      // Stop all tracks of the media stream (to release the microphone)
      if (this.mediaRecorder.stream) {
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    this.isRecording = false; // Mark recording as stopped
  }
}

toggleDropdown() {
  this.isdropdownFileToggle = !this.isdropdownFileToggle
}



}
