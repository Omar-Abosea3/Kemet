import { Schema, model } from "mongoose";

const postSchema = new Schema({
    desc:{
        type:String,
        trim:true
    },
    
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    updatedBy:{
        type:Schema.Types.ObjectId,
        ref:'User',
    },
    deletedBy:{
        type:Schema.Types.ObjectId,
        ref:'User',
    },
    images:[{
        secure_url:{
            type : String ,
            required:true
        },
        public_id:{
            type : String ,
            required:true
        }
    }],
    location:{
        type:String,
        required:true,
        trim:true,
    },
    likes:[{
        type:Schema.Types.ObjectId,
        ref:"User"
    }],
    likesCounter:{
        type:Number,
        default:0
    }
},{
    timestamps:true
})

const postModel = model('Post' , postSchema);
export default postModel;