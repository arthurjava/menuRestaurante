export interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  active: boolean;
}

export interface RoleOption {
  value: string;
  label: string;
}