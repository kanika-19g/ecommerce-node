import express, { Response, Request, Router } from 'express';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
import Product from "../schema/product";
import { IProduct } from "../models/iproduct";
import User from '../schema/user';
import authGuard from '../middlewares/auth-guard';

const ProductRouter: Router = express.Router();

ProductRouter.get('/', async (request: Request, response: Response) => {
    try {
        let products: Array<0> = [];
        if (request.query.categoryId) {
            const { categoryId } = request.query;
            // get all products from DB
            products = await Product.find({ categoryId: categoryId }) //Product.find();
        } else {
            products = await Product.find();
        }

        if (!products) {
            return response.status(404).json({
                msg: "No Products Found"
            });
        }
        return response.status(200).json({
            data: products
        });
    } catch (error) {
        return response.status(500).json({
            msg: "Unable to get the products",
            error: error
        });
    }
})

ProductRouter.get('/:id', async (request: Request, response: Response) => {
    try {
        let { id } = request.params;
        // get all products from DB
        let product = await Product.findById(id);
        if (!product) {
            return response.status(404).json({
                msg: "No Product Found"
            });
        }
        return response.status(200).json({
            data: product
        });
    } catch (error) {
        return response.status(500).json({
            msg: "Unable to get the product",
            error: error
        });
    }
})

ProductRouter.put('/edit/:id', authGuard, [
    body('name').not().isEmpty().withMessage("Name is Required"),
    body('price').not().isEmpty().withMessage("Price is Required"),
    body('quantity').not().isEmpty().withMessage("Quantity is Required"),
], async (request: Request, response: Response) => {
    let errors = validationResult(request);
    if (!errors.isEmpty()) {
        response.status(400).json({
            errors: errors
        })
    }
    try {
        let userObj: any = request.headers['user'];
        let user = await User.findById(userObj.id);
        if (!user) {
            return response.status(404).json({
                msg: 'No user found with the Token!'
            });
        }

        // check is admin
        if (!user.isSeller) {
            return response.status(401).json({
                msg: 'You are not a seller!'
            });
        }
        let { id } = request.params;
        let product = await Product.findById(id);
        if (product) {
            let { name, price, quantity, availability, imageUrl, categoryId, vendorId } = request.body;

            // prepare the product object
            let editedProduct: any = {
                name: name,
                price: price,
                quantity: quantity,
                availability: quantity ? true : false,
                imageUrl: imageUrl,
                categoryId: categoryId,
                vendorId: vendorId
            }
            let updatedProduct = await Product.findByIdAndUpdate(id, editedProduct, { new: true });
            if (updatedProduct) {
                return response.status(200).json({
                    msg: "Product has been updated",
                    data: updatedProduct
                })
            }
        }
    } catch (err) {
        return response.status(500).json({
            msg: err,
            data: null
        })
    }


})

ProductRouter.delete('/delete/:id', authGuard, async (request: Request, response: Response) => {
    try {
        let { id } = request.params;
        let userObj: any = request.headers['user'];
        let user = await User.findById(userObj.id);
        if (!user) {
            return response.status(404).json({
                msg: 'No user found with the Token!'
            });
        }




        let product = await Product.findById(id);

        if (product) {
            // check is admin
            if (!user.isSeller || user.id != product.vendorId) {
                return response.status(401).json({
                    msg: 'You are not the seller of this product!'
                });
            }
            product = await Product.findByIdAndRemove(id);
            return response.status(200).json({
                message: 'Product deleted successfully',
                data: product
            });
        }else{
            return response.status(400).json({
                msg: "Product not found!"
            })
        }

    } catch (error) {
        return response.status(500).json({
            msg: "Unable to Delete the product"
        });
    }
})

ProductRouter.post('/add', authGuard, [
    body('name').not().isEmpty().withMessage("Name is Required"),
    body('price').not().isEmpty().withMessage("Price is Required"),
    body('quantity').not().isEmpty().withMessage("Quantity is Required"),
    body('vendorId').not().isEmpty().withMessage("please login to add a product"),
], async (request: Request, response: Response) => {
    let errors = validationResult(request);
    if (!errors.isEmpty()) {
        response.status(400).json({
            errors: errors
        })
    }
    let userObj: any = request.headers['user'];
    let user = await User.findById(userObj.id);
    if (!user) {
        return response.status(404).json({
            msg: 'No user found with the Token!'
        });
    }

    // check is admin
    if (!user.isSeller) {
        return response.status(401).json({
            msg: 'You are not the seller!'
        });
    }
    try {
        let { name, price, quantity, availability, imageUrl, categoryId, vendorId } = request.body;

        //check if vendor exists

        let vendorDetails = await User.findById(vendorId);

        // console.log(vendorDetails);

        if (!vendorDetails) {
            return response.status(400).json({
                msg: "Please login",
                data: []
            })
        }
        let { isSeller } = vendorDetails;
        console.log("isSeller", isSeller);
        if (isSeller) {
            // prepare the product object
            let product: any = {
                name: name,
                price: price,
                quantity: quantity,
                availability: quantity ? true : false,
                imageUrl: imageUrl,
                categoryId: categoryId,
                vendorId: vendorId
            }
            // save to MongoDB
            product = new Product(product);
            product = await product.save();
            if (product) {
                return response.status(200).json({
                    msg: "Product added successfully",
                    data: product
                })
            }


        }
        else {
            return response.status(200).json({
                msg: "Only seller can add products",
                data: null
            });
        }
    } catch (err) {
        return response.status(500).json({
            msg: "Unable to save the product",
            error: err
        });
    }




})

export default ProductRouter;