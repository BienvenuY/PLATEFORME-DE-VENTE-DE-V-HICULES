const mongoose = require("mongoose");

// create user schema 

const userSchema = new mongoose.Schema({
    first_name:{
        type: String,
        required: true
    },

        last_name:{
        type: String,
        required: true
    },

        email:{
        type: String,
        required: true
    },

        password:{
        type: String,       
        required: true
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Car" }],
    phone: { type: String, default: "" },
},{timestamps:true})

// timestamps will add to the document two attributes createdAt et updatedAt


// we will export the model of the user based on the userschema to use it in other
module.exports = mongoose.model("User", userSchema)