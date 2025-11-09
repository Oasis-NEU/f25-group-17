export interface UserData {
  user_id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  major: string | null;
  year: string | null;
  courses: string[] | null;
}