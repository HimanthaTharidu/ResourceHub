import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("mongodb connected sucessfully")
    } catch (error) {
        console.log("error conecting MongoDb", error)
        process.exit(1);
    }
}

export default connectDB