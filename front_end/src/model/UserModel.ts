export class UserModel {
    id?: number;
    firstName: string;
    lastName: string;
    password: string;
    email: string;
    isAdmin: boolean;
    token?: string;
  
    constructor(obj: Partial<UserModel>) {
      this.firstName = obj.firstName ?? '';
      this.lastName = obj.lastName ?? '';
      this.email = obj.email ?? '';
      this.password = obj.password ?? '';
      this.isAdmin = obj.isAdmin ?? false;
      this.id = obj.id;
      this.token = obj.token;
    }
  }
  