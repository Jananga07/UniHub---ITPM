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
     },
     societyId:{
        type:String,
        required:false,
     },
});

module.exports = mongoose.model(
    "UserModel",
    UserSchema
)
