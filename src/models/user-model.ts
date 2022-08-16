export interface IUser {
    _id?: string;
    name: string;
    email: string;
    password: string;
    avatarImg: string;
    isSeller: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}