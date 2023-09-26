import { Router } from "express";
import multerFunction from "../../services/multerCloudinary.js";
import allowedEstensions from "../../utils/allowedExtensions.js";
import * as post from './posts.controller.js'
import authentication from "../../middleware/authentication.js";
import { validationCoreFunction } from "../../middleware/validation.js";
import logOutMiddleware from "../../middleware/logOutMiddleware.js";
import { roleSecurity } from "../../utils/systemRoles.js";
import { deletePostSchema, getPostSchema, makeLikesSchema } from "./posts.validationSchema.js";
const router = Router();

router.post('/'  , authentication(roleSecurity.available) , logOutMiddleware ,   multerFunction(allowedEstensions.Images).array('image' , 3) , post.addPost);
router.put('/' , authentication(roleSecurity.available) , logOutMiddleware , multerFunction(allowedEstensions.Images).array('image' , 3)  , post.updatePost);
router.delete('/:id', authentication(roleSecurity.available) , logOutMiddleware , validationCoreFunction(deletePostSchema) , post.deletePost);
router.get('/' , authentication(roleSecurity.available), logOutMiddleware , validationCoreFunction(getPostSchema) ,post.getAllPosts);
router.get('/user', authentication(roleSecurity.available) , logOutMiddleware , validationCoreFunction(getPostSchema) , post.getUserPosts);
router.post('/like' , authentication(roleSecurity.available) , logOutMiddleware  , validationCoreFunction(makeLikesSchema), post.makeLikes)


export default router ;