import User from "../models/User.js";
import jwt from "jsonwebtoken"

const handleErrors = (err) => {
    console.log(err.message, err.code)
    let errors = {email: '', password: ''};

    //duplicate errors
    if(err.code === 11000){
        errors.email = "Email already exist";
        return errors;
    }
    //validation errors
    if(err.message.includes("User validation failed")){
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        })
    }
    return errors
}

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: maxAge
    });
}

export async function signup_get(req,res,next) {
    res.send('signup')
}

export async function login_get(req,res,next) {
    res.send('login')
}

export async function signup_post(req,res,next) {
    const {name, email, department, role, password} = req.body;

    try {
        const user = await User.create({
            name, 
            email, 
            department, 
            role, 
            password
        });
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000})
        res.status(201).json({user: user._id})
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json(errors);
    }
}

export async function login_post(req,res,next) {
    res.send('new signup')
}