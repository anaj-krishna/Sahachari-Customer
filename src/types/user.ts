export enum Role {
  USER = 'USER',
  DELIVERY = 'DELIVERY',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  shopAddress?: string;
}
