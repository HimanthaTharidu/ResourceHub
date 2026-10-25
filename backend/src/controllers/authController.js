import User from "../models/User.js";

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
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: "error, user not created" });
    }
}

export async function login_post(req,res,next) {
    res.send('new signup')
}