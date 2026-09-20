export interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "MANAGER" | "STAFF";
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
