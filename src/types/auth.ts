export interface SessionUser {
  id: string;
  email: string;
  role: string;
  full_name?: string;
  name?: string;
  mobile_number?: string;
  profile_picture?: string;
}

export interface AuthSession {
  user: SessionUser;
  expires: string;
}

