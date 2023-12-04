import { Router } from "express";
import * as monument from './monuments.controller.js'
import authentication from "../../middleware/authentication.js";
import { validationCoreFunction } from "../../middleware/validation.js";
import multerFunction from "../../services/multerCloudinary.js";
import allowedEstensions from "../../utils/allowedExtensions.js";
import logOutMiddleware from "../../middleware/logOutMiddleware.js";
import { roleSecurity } from "../../utils/systemRoles.js";
import { addMonumentSchema, deleteMonumentSchema, getAllMonumentsSchema, getMonumentSchema, updateMonumentSchema } from "./monuments.validationSchema.js";
const router = Router();

router.post('/'  , authentication(roleSecurity.private) , logOutMiddleware , validationCoreFunction(addMonumentSchema) , monument.addMonument);
router.put('/' , authentication(roleSecurity.private) , logOutMiddleware , validationCoreFunction(updateMonumentSchema) , multerFunction(allowedEstensions.Images).array('image' , 10) , monument.updateMonument);
router.delete('/:id', authentication(roleSecurity.private) , logOutMiddleware , validationCoreFunction(deleteMonumentSchema) , monument.deleteMonument);
router.get('/', authentication(roleSecurity.available) , logOutMiddleware , validationCoreFunction(getMonumentSchema) , monument.getOneMonument);
router.get('/monuments' , authentication(roleSecurity.available) , logOutMiddleware ,validationCoreFunction(getAllMonumentsSchema) ,monument.getAllMonuments);

export default router ;