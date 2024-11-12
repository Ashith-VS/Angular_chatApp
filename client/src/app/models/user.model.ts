export interface userModel {
    _id: string;
    username: string;
    email: string;
    avatar: string;
   about: string;
   status: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }

 export interface User {
    _id: string;
    username: string;
    email: string;
    password: string;
    avatar: string;
    onlineStatus: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }
  export interface userSearchModel {
    status: number;
    message: string;
    users: User[];
  }

  export interface Users {
    _id: string;
    username: string;
    email: string;
    avatar: string;
    onlineStatus: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }

  export interface Sender {
    _id: string;
    username: string;
    email: string;
    avatar: string;
  }

  export interface LatestMessage {
    _id: string;
    sender: Sender;
    chat: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }
  export interface chatModel {
    _id: string;
    chatName: string;
    isGroupChat: boolean;
    users: Users[];
    groupAdmin: User[];
    groupImage: string;
    groupCreator:string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    latestMessage: LatestMessage;
  }