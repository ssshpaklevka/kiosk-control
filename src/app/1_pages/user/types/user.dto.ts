import { USER_ROLE } from "../enum/role.enum";

export interface UserCreate {
  email: string;
  id_store: number;
  last_name: string;
  first_name: string;
  middle_name: string;
  role: USER_ROLE;
}

export interface UserRole {
  id: USER_ROLE;
  label: string;
}
