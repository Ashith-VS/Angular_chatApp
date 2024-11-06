import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-modal',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './profile-modal.component.html',
  styleUrl: './profile-modal.component.css'
})
export class ProfileModalComponent {
  constructor(private routes:Router){}

  isProfileModalVisible = true;
  editing = false;

  profileInfo = {
    avatar: 'path-to-avatar-image', // Replace with the actual image path or URL
    name: 'John Doe',
    status: 'Hello, I am using Chat App'
  };

  openProfileModal() {
    this.isProfileModalVisible = true;
  }

  closeProfileModal() {
    this.isProfileModalVisible = false;
    this.editing = false;
    this.routes.navigate(['home'])
  }

  startEditing() {
    this.editing = true;
  }

  updateProfile() {
    // Add logic to update profile information
    this.editing = false;
    this.closeProfileModal();
  }
}
