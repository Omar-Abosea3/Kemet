import joi from "joi";
import { generalFields } from "../../middleware/validation.js";


export const addMonumentSchema = {
    body:joi.object({
        desc:generalFields.desc, 
        monumentName:generalFields.monumentName,
    }).required().options({presence:'required'})
};

export const updateMonumentSchema = {
    body:joi.object({
        desc:generalFields.desc, 
        monumentName:generalFields.monumentName,
    }).required(),

    query:joi.object({
        monumentId:generalFields._id.required(),
    }).required()
};

export const deleteMonumentSchema = {
    params:joi.object({
        id : generalFields._id.required(),
    }).required(),
};

export const getMonumentSchema = {
    query:joi.object({
        monumentName : generalFields.monumentName.required(),
        lang : generalFields.lang
    }).required(),
};

export const getAllMonumentsSchema = {
    query:joi.object({
        lang:generalFields.lang
    }).required(),
};