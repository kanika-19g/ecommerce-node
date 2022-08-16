import {Schema, model} from "mongoose";
import { IProduct } from "../models/iproduct";

const productSchema: Schema = new Schema<IProduct>({
    name: {type: String, required: true, unique: true},
    imageUrl: {type: String},
    quantity: {type: Number, required: true},
    vendorId: {type: String},
    categoryId: {type: Number},
    availability: {type: Boolean, required: true},
    price: {type: String, required: true}
}, {timestamps: true});

const Product = model<IProduct>('products', productSchema);



// export default Login;
export default Product;