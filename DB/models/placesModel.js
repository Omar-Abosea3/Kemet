import { Schema, model } from "mongoose";

const placeSchema = new Schema({
    placeName:{
        type:String,
        trim:true,
        required:true,
        unique:true
    },
    desc:{
        type:String,
        trim:true,
        required:true
    },
    customId:String,
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
            required:true,
        }
    }],
    location:String
},{
    timestamps:true
})

const placeModel = model('Place' , placeSchema);
export default placeModel;