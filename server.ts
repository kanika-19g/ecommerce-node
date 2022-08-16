import express, {Application} from "express";
import dotenv from 'dotenv';
import mongoose from "mongoose";
import ProductRouter from "./src/routing/product-routing";
import CategoryRouter from "./src/routing/category-routing";
import User from "./src/routing/user-routing";
import UserRouter from "./src/routing/user-routing";

const app: Application = express();

// configure express to receive form data
app.use(express.json());
// configure dot-env
dotenv.config({
    path: './.env'
});
const hostName: string | undefined = process.env.HOST_NAME;
const port: number | undefined = Number(process.env.PORT) || 9999;

// connect to local mongodb
const dbUrl: string | undefined = process.env.MONGO_DB_LOCAL_URL;
const dbName: string | undefined = process.env.DATA_BASE_NAME;

app.use('/api/products', ProductRouter);
app.use('/api/categories', CategoryRouter);
app.use('/api/orders', CategoryRouter);
app.use('', UserRouter);


if(dbUrl && dbName){
    mongoose.connect(dbUrl, {dbName : dbName}).then(() => {
        console.log('Connected Successfully to MongoDB.');
    }).catch((error) => {
        throw error;
    });
}


if (port && hostName) {
    app.listen(port, hostName, () => {
        console.log(`Express JS Server is started at http://${hostName}:${port}`);
    });
}