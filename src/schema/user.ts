import {Schema, model, Model} from "mongoose";
import {IUser} from "../models/user-model";

const userSchema: Schema = new Schema<IUser>({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    avatarImg: {type: String},
    isSeller: {type: Boolean, required: true}
}, {timestamps: true});

const User: Model<IUser> = model<IUser>('users', userSchema);
export default User;