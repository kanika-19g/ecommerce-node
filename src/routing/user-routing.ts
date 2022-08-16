import express, { Response, Request, Router } from 'express';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
import User from '../schema/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const UserRouter: Router = express.Router();

UserRouter.get('/', async (request: Request, response: Response) => {
    try {
        let users = await User.find();
        if (!users) {
            return response.status(404).json({
                msg: "No users Found"
            });
        }
        return response.status(200).json({
            data: users
        });
    } catch (error) {
        return response.status(500).json({
            msg: "Unable to get the categories",
            error: error
        });
    }
})

UserRouter.post('/login', [
    body('email').isEmail().withMessage("Proper Email is Required"),
    body('password').isStrongPassword({
        minSymbols: 1,
        minNumbers: 1,
        minUppercase: 1,
        minLowercase: 1,
        minLength: 5
    }).withMessage("Strong Password is Required")
], async (request: Request, response: Response) => {

    // validation handling
    let errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(400).json({
            errors: errors
        })
    }

    try {
        // read the form data
        let {email, password} = request.body;

        // check if email id exists
        let user = await User.findOne({email: email});
        if (!user) {
            return response.status(401).json({
                msg: "Invalid Credentials, Email"
            });
        }

        // validate the password
        let isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return response.status(401).json({
                msg: "Invalid Credentials, Password"
            });
        }

        // generate a token and send to client
        let payload = {
            user: {
                id: user._id,
                email: user.email
            }
        }
        const secretKey: string | undefined = process.env.JWT_SECRET_KEY;
        if (secretKey) {
            let token: string = jwt.sign(payload, secretKey, {expiresIn: 10000000});
            return response.status(200).json({
                msg: 'Login is Success!',
                token: token
            });
        }
    } catch (error) {
        return response.status(500).json({
            msg: "Unable to Login a user",
            error: error
        });
    }
});

UserRouter.post('/register', [
    body('name').not().isEmpty().withMessage("Name is Required"),
    // body('isSeller').not().isEmpty().withMessage("seller flag is Required"),
    body('email').isEmail().withMessage("Proper Email is Required"),
    body('password').isStrongPassword({
        minSymbols: 1,
        minNumbers: 1,
        minUppercase: 1,
        minLowercase: 1,
        minLength: 5
    }).withMessage("Strong Password is Required"),
], async (request: Request, response: Response) => {

    // validation handling
    let errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(400).json({
            errors: errors
        })
    }

    try {
        let {name, email, password, isSeller} = request.body;

        // check if user is exists
        let user = await User.findOne({email: email});
        if (user) {
            return response.status(400).json({
                msg: "The user is already exists!"
            });
        }

        // encrypt the password
        let salt = await bcrypt.genSalt(10);
        let encryptPassword = await bcrypt.hash(password, salt);

        

        // non-admin user
        const isAdmin = false;

        // save to db
        let newUser: any = {
            name: name,
            email: email,
            password: encryptPassword,
            isSeller: isSeller || false
        }
        user = new User(newUser);
        user = await user.save(); // save to DB
        return response.status(200).json({
            msg: "User Registration is success, Please Login!"
        });
    } catch (error) {
        return response.status(500).json({
            msg: "Unable to register a user",
            error: error
        });
    }
});

export default UserRouter;