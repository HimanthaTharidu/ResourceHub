import mongoose from "mongoose";
import validator from "validator"
import bcrypt from "bcryptjs"

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please add a name"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "Please add an email"],
            unique: true,
            lowercase: true,
            trim: true,
            validate: [validator.isEmail, "Please enter a valid email address"]
        },
        password: {
            type: String,
            required: [true, "Please add a password"],
            minlength: [6, "minimum length should me 6"]
        },
        role: {
            type: String,
            enum: ['faculty', 'department_admin', 'super_admin'],
            default: 'faculty'
        },
        department: {
            type: String,
            required: [true, "Please specify a department"]
        },
    },
    {timestams: true}
)
userSchema.pre('saved', async function(next){
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

userSchema.post('saved', function(doc, next){
    console.log('new user created & saved', doc)
    next();
})

const User = mongoose.model("User", userSchema);

export default User;