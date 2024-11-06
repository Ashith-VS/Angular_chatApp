import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApilistService } from '../../services/apilist.service';

@Component({
  selector: 'app-new-group-modal',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './new-group-modal.component.html',
  styleUrl: './new-group-modal.component.css'
})
export class NewGroupModalComponent {
  constructor(private routes:Router ,private groupService:ApilistService ){}
  
  isNewGroupModalOpen = true;
  groupName: string = '';
  search:string = '';
  searchResults:any=[];
  selectedUsers:any=[] 



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
      this.selectedUsers.push(user);
      // Remove the added user from the search results
      this.searchResults = this.searchResults.filter((u: any) => u._id !== user._id);
      console.log('this.selectedUsers: ', this.selectedUsers);
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
      users: this.selectedUsers
    }

    this.groupService.createGroupChat(data).subscribe(res=>{
      console.log("groupchat44",res)
    })
    
    // Clear input field after creating the group
    // this.groupName = '';
    // this.selectedUsers = [];
    // this.search = '';
    // this.searchResults = [];
    // this.closeNewGroupModal();
  }
}
