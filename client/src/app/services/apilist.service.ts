import { Injectable } from '@angular/core';
import { NetworkService } from '../http/api';

@Injectable({
  providedIn: 'root'
})
export class ApilistService {

  constructor(private networkService:NetworkService) { }

  islogin(data:any) {
    const url='/auth/login';
    return this.networkService.networkRequest({url,method:"post",data:data})
  }

  isRegister(data:any) {
    const url='/auth/register';
    return this.networkService.networkRequest({url,method:"post",data})
  }

  isCurrrentUser(){
    const url='/auth/currentuser';
    return this.networkService.networkRequest({url})
  }

  getUsersBySearch(search:string){
    const url=`/api/message/findUser?search=${search}`;
    return this.networkService.networkRequest({url})
  }

  getAccessChat(chatId:string){
    const url='/api/chat/';
    return this.networkService.networkRequest({url,method:'post',data:{chatId}})
  }

  getAllChats(){
    const url='/api/chat/';
    return this.networkService.networkRequest({url})
  }

  sendMessages(data:any){
    const url='/api/message/';
    return this.networkService.networkRequest({url,method:'post',data})
  }

  fetchAllMessages(chatId:string){
    const url=`/api/message/${chatId}`;
    return this.networkService.networkRequest({url})
  }

  createGroupChat(data:any){
    const url='/api/chat/group';
    return this.networkService.networkRequest({url,method:'post',data})
  }

  renameGroupChat(data:any){
    const url='/api/chat/rename';
    return this.networkService.networkRequest({url,method:'put',data})
  }

  addUserToGroupChat(data:any){
    const url='/api/chat/groupadd';
    return this.networkService.networkRequest({url,method:'put',data})
  }

  leaveGroupChat(data:any){
    const url='/api/chat/groupremove';
    return this.networkService.networkRequest({url,method:'put',data})
  }

  isUpdateUser(data:any){
    const url='/auth/updateuser';
    return this.networkService.networkRequest({url,method:'put',data})
  }

  isChangePassword(data:any){
    const url='/auth/changePassword';
    return this.networkService.networkRequest({url,method:'post',data})
  }

  addAdminsToGroupChat(data:any){
    const url='/api/chat/groupadminadd';
    return this.networkService.networkRequest({url,method:'put',data})
  }

  removeAdminFromGroupChat(data:any){
    const url='/api/chat/groupadminremove';
    return this.networkService.networkRequest({url,method:'put',data})
  }

  deleteAccount(){
    const url='/auth/deleteaccount';
    return this.networkService.networkRequest({url,method:'put'})
  }


}
