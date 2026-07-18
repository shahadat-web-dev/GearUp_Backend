export interface IRegisterUser {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "ADMIN"| "CUSTOMER" | "PROVIDER";
}

export interface ILogin {
  email: string;
  password: string;
}