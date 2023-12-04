import joi from "joi";
import { generalFields } from "../../middleware/validation.js";


export const addPlaceSchema = {
    body:joi.object({
        desc:generalFields.desc, 
        placeName:generalFields.placeName,
    }).required().options({presence:'required'})
};

export const updatePlaceSchema = {
    body:joi.object({
        desc:generalFields.desc, 
        placeName:generalFields.placeName,
        location:joi.string().optional(),
    }).required(),

    query:joi.object({
        placeId:generalFields._id.required(),
    }).required()
};

export const deletePlaceSchema = {
    params:joi.object({
        id : generalFields._id.required(),
    }).required(),
};

export const getPlaceSchema = {
    query:joi.object({
        id : generalFields._id.required(),
        lang: generalFields.lang
    }).required(),
};

export const getAllPlacesSchema = {
    query:joi.object({
        lang:generalFields.lang
    }).required(),
};