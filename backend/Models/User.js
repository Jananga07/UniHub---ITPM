const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
     name:{
        type:String, 
        required:true, 
    },
     gmail:{
        type:String, 
        required:true, 
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address."],
     },
     password:{
         type:String,
         required: true,
     },
     role:{
        type:String,
        required:true,
     },
     age:{
        type:Number,
        required:false,
     },
     address:{
        type:String, 
        required:false,
     },
     contact:{
        type:String,
        required:false,
        validate: {
          validator: (value) => !value || /^\+?\d{10,15}$/.test(value),
          message: "Contact number must be 10 to 15 digits.",
        },
     },
     societyId:{
        type:String,
        required:false,
     },
     pin:{
        type:String,
        required:false,
     },
});

UserSchema.index(
   { societyId: 1 },
   {
      unique: true,
      partialFilterExpression: {
         role: "societyManager",
         societyId: { $exists: true, $type: "string", $ne: "" },
      },
   }
);

module.exports = mongoose.model(
    "UserModel",
    UserSchema
)
