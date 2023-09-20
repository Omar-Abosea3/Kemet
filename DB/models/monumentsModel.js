import { Schema, model } from "mongoose";

const monumentsSchema = new Schema({
    monumentName:{
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
    }
},{
    timestamps:true
})

const monumentsModel = model('Monument' , monumentsSchema);
export default monumentsModel;