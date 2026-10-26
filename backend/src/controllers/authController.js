import User from "../models/User.js";

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
        res.status(201).json(user)
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json(errors);
    }
}

export async function login_post(req,res,next) {
    res.send('new signup')
}