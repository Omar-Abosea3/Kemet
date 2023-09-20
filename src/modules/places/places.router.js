import { Router } from "express";
import multerFunction from "../../services/multerCloudinary.js";
import allowedEstensions from "../../utils/allowedExtensions.js";
import * as place from './places.controller.js'
import authentication from "../../middleware/authentication.js";
import { validationCoreFunction } from "../../middleware/validation.js";
import logOutMiddleware from "../../middleware/logOutMiddleware.js";
import { roleSecurity } from "../../utils/systemRoles.js";
import { addPlaceSchema, deletePlaceSchema, getAllPlacesSchema, getPlaceSchema, updatePlaceSchema } from "./places.validationSchema.js";
const router = Router();

router.post('/'  , authentication(roleSecurity.private) , logOutMiddleware , multerFunction(allowedEstensions.Images).array('image' , 5) , validationCoreFunction(addPlaceSchema) , place.addPlace);
router.put('/' , authentication(roleSecurity.private) , logOutMiddleware , multerFunction(allowedEstensions.Images).array('image' , 5) , validationCoreFunction(updatePlaceSchema)  , place.updatePlace);
router.delete('/:id', authentication(roleSecurity.private) , logOutMiddleware , validationCoreFunction(deletePlaceSchema) , place.deletePlace);
router.get('/' , authentication(roleSecurity.available) , logOutMiddleware ,validationCoreFunction(getAllPlacesSchema) ,place.getAllPlaces);
router.get('/place', authentication(roleSecurity.available) , logOutMiddleware , validationCoreFunction(getPlaceSchema) , place.getOnePlace);

export default router ;