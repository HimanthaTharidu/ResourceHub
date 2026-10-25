import mongoose from "mongoose";

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
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
        },
        password: {
            type: String,
            required: [true, "Please add a password"],
            minlength: 6
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

const User = mongoose.model("User", userSchema);

export default User;