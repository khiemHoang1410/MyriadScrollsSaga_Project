// client/src/features/auth/types.ts

// Type cho input của form login
export interface LoginUserInput {
  email: string;
  password: string;
}

// Type cho input của form register
export interface RegisterUserInput extends LoginUserInput {
  username: string;
}

// Type cho đối tượng user trả về
export interface User {
  _id: string;
  username: string;
  email: string;
  roles: string[];
}