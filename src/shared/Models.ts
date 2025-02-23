export interface UserModel {
    id: number | null;
    email: string;
    username: string | null;
    password: string | null;
    access_token: string | null;
    refresh_token: string | null;
    image: string | null;
}