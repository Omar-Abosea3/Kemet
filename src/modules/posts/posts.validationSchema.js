import joi from "joi";
import {generalFields} from '../../middleware/validation.js'

export const deletePostSchema = {
    params:joi.object({
        id : generalFields._id.required(),
    }).required(),
};

export const makeLikesSchema = {
    body:joi.object({
        status : joi.string().min(4).max(7),
        postId : generalFields._id
    }).required().options({presence:'required'}),
};

export const getPostSchema = {
    query:joi.object({
        lang:generalFields.lang,
    }).required(),
};