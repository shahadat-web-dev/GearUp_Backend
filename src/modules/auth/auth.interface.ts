export interface IRegisterUser {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: "CUSTOMER" | "PROVIDER";
}

export interface ILogin {
  email: string;
  password: string;
}