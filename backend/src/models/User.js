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
            minlength: [6, "minimum length should bee 6"]
        },
        role: {
            type: String,
            enum: ['faculty', 'admin'],
            default: 'faculty'
        },
        department: {
            type: String,
            required: [true, "Please specify a department"]
        },
    },
    {timestamps: true}
)
userSchema.pre('save', async function(){
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
})

/*userSchema.post('save', function(doc){
    console.log('new user created & saved', doc)
})*/

//static method to login
userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({email})
    if(user){
        const auth = await bcrypt.compare(password, user.password);
        if(auth){
            return user;
        }
        throw Error("Incorrect password")
    }
    throw Error("Incorrect email")
}

const User = mongoose.model("User", userSchema);

export default User;