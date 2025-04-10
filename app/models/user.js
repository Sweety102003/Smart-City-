import mongoose from "mongoose"
const userschema=new mongoose.Schema({
    username:{
        type:String ,
        req:true,
        unique:true,
        match:[/^[a-zA-Z0-9]+$/, 'is invalid']
    },
    password:{
        type :String ,
        req:true
    },
    email:{
        type:String , 
       match: [/\S+@\S+\.\S+/, 'is invalid'],
       req:true,
       unique:true,

    },
    roles:[{type:String,
        enum:
['viewer', 'admin']
        ,
        default: viewer,
    }]
},{timestamps:true});
const user=mongoose.models.user || moongoose.model("user" , userschema);
export default user;
