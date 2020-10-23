export interface IUser {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    admin: boolean;
    active: boolean;
    // Don't expose below
    password: string;
    token: string;
    customer_token: string;
    created_at: Date;
    updated_at: Date;
}

export interface LoginModel {
    email: string;
    password: string;
}
export interface ICreateUser {
    email: string;
    password: string;
    created_at: Date,
    last_signed_in: Date
}
export interface IResetPassword {
    email: string;
    oldPassword: string;
    newPassword: string;
}

interface IUserNames {
    first_name: string;
    last_name: string;
  }
export interface IUserAccount extends IUserNames {
    id: string;
    email: string;
    admin: boolean;
  }