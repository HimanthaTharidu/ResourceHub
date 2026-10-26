import jwt from "jsonwebtoken"
import User from '../models/User.js'

const protect = (req,res,next) => {
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if(err){
                console.log(err.message);
                res.redirect('/login')
            }
            else{
                console.log(decodedToken)
                next();
            }
        })
    }else{
        res.redirect('/login')
    }
}


const authorize = (...roles) => {
    return (req, res, next) => {
        if(!req.User || !roles.includes(req.User.role)){
            return res.status(403).json({
                message: `User role '${req.User ? req.User.role : 'unknown'}' is not authorized to access this route`
            });
        }

    }
}