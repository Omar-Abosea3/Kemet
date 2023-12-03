import { asyncHandeller } from "../../utils/errorHandlig.js";
import { roleSecurity } from "../../utils/systemRoles.js";
import monumentsModel from "../../../DB/models/monumentsModel.js";
import translate from "translate";
import { nanoid } from "nanoid";
import cloudinary from "../../utils/cloudinaryConfigration.js";
export const addMonument = asyncHandeller(async (req, res, next) => {
    const { desc  , monumentName} = req.body;
    if(!monumentName){
      return next(new Error('you must send me monumentName' , {cause:400}));
    }
    if(await monumentsModel.findOne({monumentName})){
        return next(new Error('Duplicate monument name enter a new one' , {cause:400}));
    }
    if(!desc){
      return next(new Error('you must send me description' , {cause:400}));

    }
    const monumentOpject = {
      monumentName,
      createdBy:req.user._id,
      desc
    };
    const monument = await monumentsModel.create(monumentOpject);
    if (!monument) {
      return next(
        new Error("monument not added , try again later", { cause: 400 })
      );
    }
    return res
      .status(201)
      .json({ message: "monument added successfully", monument });
});

export const updateMonument = asyncHandeller(async (req, res, next) => {
    const {  desc , monumentName } = req.body;
    const { monumentId } = req.query;
    const monument = await monumentsModel.findOne({_id:monumentId});
    if (!monument) {
      return next(new Error("not founded monument or not authorized to update it", { cause: 400 }));
    }
    if(desc){
      if(monument.desc == desc){
        return next(new Error('change thing in description this is duplicated or the same last one' , {cause:400}));
      }
      monument.desc = desc;
    }
    if( monumentName ){
      if(monument.monumentName == monumentName || await monumentsModel.findOne({monumentName})){
        return next(new Error('change thing in monumentName this is the same last one' , {cause:400}));
      }
      monument.monumentName = monumentName;
    }
    if (req.files?.length) {
      const customId = nanoid();
      console.log(req.file);
      const images = [];
      for (const file of req.files) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          file.path,
          {
            folder: `${process.env.PROJECT_FOLDER}/Monuments/${customId}`,
          }
        );
        images.push({ secure_url, public_id });
      }
      req.imagePath = `${process.env.PROJECT_FOLDER}/Monuments/${customId}`;
      // const publicIds = [];
      // for (const image of monument.images) {
      //   publicIds.push(image.public_id);
      // }
      // await cloudinary.api.delete_resources(publicIds);
      monument.images = images;
      monument.customId = customId;
    }
    monument.updatedBy = req.user._id;
    await monument.save();
    return res.status(200).json({ message: "updated success", monument });
});

export const deleteMonument = asyncHandeller(async (req, res, next) => {
    const { id } = req.params;
    const monument = await monumentsModel.findByIdAndDelete(id);
    if (!monument) {
      return next(new Error("this monument is not founded", { cause: 404 }));
    }
    if(req.user._id.toString() != monument.createdBy.toString() || !roleSecurity.private.includes(req.user.role)){
      return next(new Error('you are not permitted to delete this monument'))
    }
    return res.status(200).json({ message: "deleted done", monument });
});

export const getOneMonument = asyncHandeller(async (req, res, next) => {
    const {monumentName , lang} = req.query;
    const monument = await monumentsModel.findOne({monumentName});
    if (!monument) {
        return next(new Error("this monument is not found", { cause: 404 }));
    }

    if(!lang){
      return res.status(200).json({ message: "success", monument });
    }
    const monumentAfterTranslate = {};
    monumentAfterTranslate.desc = await translate(monument.desc , lang);
    monumentAfterTranslate.monumentName = await translate(monument.monumentName , lang);
    monumentAfterTranslate._id = monument._id;
    monumentAfterTranslate.images = monument.images;
    return res.status(200).json({ message: "success", monumentAfterTranslate });
});