import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApilistService } from '../../services/apilist.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-new-group-modal',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './new-group-modal.component.html',
  styleUrl: './new-group-modal.component.css'
})
export class NewGroupModalComponent {
  constructor(private routes:Router ,private groupService:ApilistService, private toast:ToastrService ){}
  
  isNewGroupModalOpen = true;
  groupName: string = '';
  search:string = '';
  searchResults:any=[];
  selectedUsers:any=[] 
  groupImagePreview: string| ArrayBuffer | null = null;
  showSuccessModal:boolean = false;


  handleImage (event: Event){
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.groupImagePreview = reader.result;
        // console.log('this.groupImagePreview: ', this.groupImagePreview);
      };
      reader.readAsDataURL(file);
    }

  }


  closeNewGroupModal() {
    this.isNewGroupModalOpen = false;
    this.routes.navigate(['/home']);
  }

  handleSearch(){
    if(!this.search) return;
    this.groupService.getUsersBySearch(this.search).subscribe((res:any)=>{
      // this.searchResults=res.users;
       // Filter out users that are already selected
       this.searchResults = res.users.filter((user: any) =>
        !this.selectedUsers.some((selectedUser:any) => selectedUser._id === user._id)
      );
    })
  }

  addUser(user:any){
    
    if (!this.selectedUsers.some((selectedUser:any) => selectedUser._id === user._id)) {
      
      this.selectedUsers=[...this.selectedUsers,user]
      // console.log('this.selectedUsers1: ', this.selectedUsers);
      
      // Remove the added user from the search results
      this.searchResults = this.searchResults.filter((u: any) => u._id !== user._id);
    }
  }
  
  

  removeUser(user:any){
    // this.selectedUsers=this.selectedUsers.filter((u:any)=>u._id!==user._id);
     // Remove the user from the selected list
     this.selectedUsers = this.selectedUsers.filter((u: any) => u._id !== user._id);

     // Optionally, add the removed user back to the search results if they match the search term
     if (this.search && user.name.toLowerCase().includes(this.search.toLowerCase())) {
       this.searchResults.push(user);
     }
  }



  handleCreateGroup(e:Event) {

    e.preventDefault();
    const data={
      chatName: this.groupName,
      users: this.selectedUsers,
      groupImage: this.groupImagePreview
    }

    this.groupService.createGroupChat(data).subscribe({
    next:  (res)=>{
      // console.log("groupchat44",res)
      // Clear input field after creating the group
    this.groupName = '';
    this.selectedUsers = [];
    this.search = '';
    this.searchResults = [];
// show success modal
this.showSuccessModal=true
    }
   , error: (err) => {
      this.toast.error(err.message||'Failed to create group chat. Please try again.');
    }})
    
    
  }

  handleNavigate(data:string){
    this.closeNewGroupModal();
    this.showSuccessModal=false
    this.routes.navigate([data]);

  }
}
