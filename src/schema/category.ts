import {Schema, model} from "mongoose";
import { ICategory } from "../models/category-model";

const categorySchema: Schema = new Schema<ICategory>({
    name: {type: String, required: true, unique: true}
}, {timestamps: true});

const Category = model<ICategory>('categories', categorySchema);



// export default Login;
export default Category;