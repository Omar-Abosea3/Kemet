import { asyncHandeller } from "../../utils/errorHandlig.js";
import cloudinary from "../../utils/cloudinaryConfigration.js";
import { nanoid } from "nanoid";
import paginationFunction from "../../utils/pagination.js";
import { roleSecurity } from "../../utils/systemRoles.js";
import placeModel from "../../../DB/models/placesModel.js";
import translate from "translate";

export const addPlace = asyncHandeller(async (req, res, next) => {
    const { desc  , placeName} = req.body;
    if(!placeName){
      return next(new Error('you must send me placeName' , {cause:400}));
    }
    if(await placeModel.findOne({placeName})){
        return next(new Error('Duplicate place name enter a new one' , {cause:400}));
    }
    if(!desc){
      return next(new Error('you must send me description' , {cause:400}));
    }
    if (!req.files?.length) {
      return next(new Error("please upload pictures", { cause: 400 }));
    }
    const customId = nanoid();
    const images = [];
    const publicIds = [];
    for (const file of req.files) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `${process.env.PROJECT_FOLDER}/Places/${customId}`,
        }
      );
      images.push({ secure_url, public_id });
      publicIds.push(public_id);
    }
    req.imagePath = `${process.env.PROJECT_FOLDER}/Places/${customId}`;

    const postOpject = {
      images,
      placeName,
      customId,
      createdBy:req.user._id,
      desc
    };
    const post = await placeModel.create(postOpject);
    if (!post) {
      await cloudinary.api.delete_resources(publicIds);
      return next(
        new Error("place not added , try again later", { cause: 400 })
      );
    }
    return res
      .status(201)
      .json({ message: "place added successfully", post });
});

export const updatePlace = asyncHandeller(async (req, res, next) => {
    const {  desc , placeName , location } = req.body;
    const { placeId } = req.query;
    const place = await placeModel.findOne({_id:placeId});
    if (!place) {
      return next(new Error("not founded place or not authorized to update it", { cause: 400 }));
    }
    if(desc){
      if(place.desc == desc){
        return next(new Error('change thing in description this is duplicated or the same last one' , {cause:400}));
      }
      place.desc = desc;
    }
    if(location){
      if(place.location == location){
        return next(new Error('change thing in location this is duplicated or the same last one' , {cause:400}));
      }
      place.location = location;
    }
    if( placeName ){
      if(place.placeName == placeName || await placeModel.findOne({placeName})){
        return next(new Error('change thing in placeName this is the same last one' , {cause:400}));
      }
      place.placeName = placeName;
    }
    if (req.files?.length) {
      console.log(req.file);
      const images = [];
      for (const file of req.files) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          file.path,
          {
            folder: `${process.env.PROJECT_FOLDER}/Places/${place.customId}`,
          }
        );
        images.push({ secure_url, public_id });
      }
      req.imagePath = `${process.env.PROJECT_FOLDER}/Places/${place.customId}`;
      const publicIds = [];
      for (const image of place.images) {
        publicIds.push(image.public_id);
      }
      await cloudinary.api.delete_resources(publicIds);
      place.images = images;
    }
    place.updatedBy = req.user._id;
    await place.save();
    return res.status(200).json({ message: "updated success", place });
});

export const deletePlace = asyncHandeller(async (req, res, next) => {
    const { id } = req.params;
    const place = await placeModel.findByIdAndDelete(id);
    if (!place) {
      return next(new Error("this place is not founded", { cause: 404 }));
    }
    if(req.user._id.toString() != place.createdBy.toString() || !roleSecurity.private.includes(req.user.role)){
      return next(new Error('you are not permitted to delete this place'))
    }
    const publicIds = [];
    for (const image of place.images) {
      publicIds.push(image.public_id);
    }
    await cloudinary.api.delete_resources(publicIds);
    await cloudinary.api.delete_folder(
      `${process.env.PROJECT_FOLDER}/Places/${place.customId}`
    );
    return res.status(200).json({ message: "deleted done", place });
});

export const getAllPlaces = asyncHandeller(async (req, res, next) => {
  const { lang } = req.query;
  const places = await placeModel.find();
  if (places.length == 0) {
    return next(new Error("no places founded", { cause: 404 }));
  }
  if(!lang){
    return res.status(200).json({ message: "success", places  });
  }
  const placesAfterTranslate = [];
  for (const place  of places) {
    const desc = await translate(place.desc , lang);
    const placeName = await translate(place.placeName , lang);
    const _id = place._id;
    const images = place.images;
    placesAfterTranslate.push({desc , placeName , _id , images});
  }
  return res.status(200).json({ message: "success", placesAfterTranslate  });
});

export const getOnePlace = asyncHandeller(async (req, res, next) => {
    const {id , lang} = req.query;
    const place = await placeModel.findById(id);
    if (!place) {
        return next(new Error("this place is not found", { cause: 404 }));
    }
    if(!lang){
      return res.status(200).json({ message: "success", place });
    }
    const placeAfterTranslate = {};
    placeAfterTranslate.desc = await translate(place.desc , lang);
    placeAfterTranslate.placeName = await translate(place.placeName , lang);
    placeAfterTranslate._id = place._id;
    placeAfterTranslate.images = place.images;
    return res.status(200).json({ message: "success", placeAfterTranslate });
});

