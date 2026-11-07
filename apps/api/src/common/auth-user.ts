export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'USER' | 'ADMIN' | 'EDITOR' | 'MODERATOR';
}
