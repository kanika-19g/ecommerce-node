import express, { Response, Request, Router } from 'express';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
import Category from '../schema/category';

const CategoryRouter: Router = express.Router();

CategoryRouter.get('/', async (request: Request, response: Response) => {
    try {
        let categories = await Category.find();
        if (!categories) {
            return response.status(404).json({
                msg: "No categorys Found"
            });
        }
        return response.status(200).json({
            data: categories
        });
    } catch (error) {
        return response.status(500).json({
            msg: "Unable to get the categories",
            error: error
        });
    }
})

CategoryRouter.post('/add', [
    body('name').not().isEmpty().withMessage("Name is Required"),
], async (request: Request, response: Response) => {
    let errors = validationResult(request);
    if (!errors.isEmpty()) {
        response.status(400).json({
            errors: errors
        })
    }
    try {
        let { name } = request.body;

        // prepare the category object
        let category: any = {
            name: name,
        }
        // save to MongoDB
        category = new Category(category);
        category = await category.save();
        if (category) {
            return response.status(200).json({
                msg: "category added successfully",
                data: category
            })
        }

    } catch (err) {
        return response.status(500).json({
            msg: "Unable to save the category",
            error: err
        });
    }



})

CategoryRouter.delete('/delete/:id', async (request: Request, response: Response) => {
    try {
        let { id } = request.params;

        let category = await Category.findById(id);

        if (category) {
            category = await Category.findByIdAndRemove(id);
            return response.status(200).json({
                message: 'category deleted successfully',
                data: category
            });
        }else{
            return response.status(400).json({
                message: 'category not found',
                data: null
            });
        }

    } catch (error) {
        return response.status(500).json({
            msg: "Unable to Delete the category"
        });
    }
})

export default CategoryRouter;