import { asyncHandeller } from "../../utils/errorHandlig.js";
import cloudinary from "../../utils/cloudinaryConfigration.js";
import { nanoid } from "nanoid";
import paginationFunction from "../../utils/pagination.js";
import systemRoles, { roleSecurity } from "../../utils/systemRoles.js";
import postModel from "../../../DB/models/postModel.js";
import translate from "translate";

export const addPost = asyncHandeller(async (req, res, next) => {
    const { desc  , location} = req.body;
    if(!location){
      return next(new Error('you must send me location' , {cause:400}))
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
          folder: `${process.env.PROJECT_FOLDER}/Posts/${customId}`,
        }
      );
      images.push({ secure_url, public_id });
      publicIds.push(public_id);
    }
    req.imagePath = `${process.env.PROJECT_FOLDER}/Posts/${customId}`;

    const postOpject = {
      images,
      location,
      customId,
      createdBy:req.user._id
    };
    if(desc){
      postOpject.desc = desc;
    }
    console.log(postOpject);
    const post = await postModel.create(postOpject);
    if (!post) {
      await cloudinary.api.delete_resources(publicIds);
      return next(
        new Error("post not added , try again later", { cause: 400 })
      );
    }
    return res
      .status(201)
      .json({ message: "post added successfully", post });
});

export const updatePost = asyncHandeller(async (req, res, next) => {
    const {  desc , location } = req.body;
    const { postId } = req.query;
    console.log(req.files);
    const post = await postModel.findOne({_id:postId ,createdBy:req.user._id});
    if (!post) {
      return next(new Error("not founded post or not authorized to update it", { cause: 400 }));
    }
    if(desc){
      console.log(post);
      console.log(post.desc == desc);
      if(post.desc == desc){
        return next(new Error('change thing in description' , {cause:400}));
      }
      post.desc = desc;
    }
    if(location){
      if(post.location == location){
        return next(new Error('change thing in Location' , {cause:400}));
      }
      post.location = location;
    }
    if (req.files?.length) {
      console.log(req.file);
      const images = [];
      for (const file of req.files) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          file.path,
          {
            folder: `${process.env.PROJECT_FOLDER}/Posts/${post.customId}`,
          }
        );
        images.push({ secure_url, public_id });
      }
      req.imagePath = `${process.env.PROJECT_FOLDER}/Posts/${post.customId}`;
      const publicIds = [];
      for (const image of post.images) {
        publicIds.push(image.public_id);
      }
      await cloudinary.api.delete_resources(publicIds);
      post.images = images;
    }
    post.updatedBy = req.user._id;
    await post.save();
    return res.status(200).json({ message: "updated success", post });
});

export const deletePost = asyncHandeller(async (req, res, next) => {
    const { id } = req.params;
    const post = await postModel.findByIdAndDelete(id);
    if (!post) {
      return next(new Error("this post is not founded", { cause: 404 }));
    }
    if(req.user._id.toString() != post.createdBy.toString() || !roleSecurity.private.includes(req.user.role)){
      return next(new Error('you are not permitted to delete this post'))
    }
    const publicIds = [];
    for (const image of post.images) {
      publicIds.push(image.public_id);
    }
    await cloudinary.api.delete_resources(publicIds);
    await cloudinary.api.delete_folder(
      `${process.env.PROJECT_FOLDER}/Posts/${post.customId}`
    );
    return res.status(200).json({ message: "deleted done", post });
});

export const getAllPosts = asyncHandeller(async (req, res, next) => {
  const { lang } = req.query;
  const posts = await postModel.find().populate({
    path:'createdBy',
    select:'userName profile_pic'
  });
  if (posts.length == 0) {
    return next(new Error("no posts founded", { cause: 404 }));
  }
  if(!lang){
    return res.status(200).json({ message: "success", posts });
  }
  const postsAfterTranslate = [];
  for (const post of posts) {
    const descAfterTranslate = await translate(post.desc , lang);
    postsAfterTranslate.push({descAfterTranslate , post});
  }
  return res.status(200).json({ message: "success", postsAfterTranslate });
});

export const getUserPosts = asyncHandeller(async (req, res, next) => {
  const { lang } = req.query;
  const posts = await postModel.find({createdBy:req.user._id});
  if (!posts.length) {
    return next(new Error("this user not have any posts", { cause: 404 }));
  }

  if(!lang){
    return res.status(200).json({ message: "success", posts });
  }
  const postsAfterTranslate = [];
  for (const post of posts) {
    const descAfterTranslate = await translate(post.desc , lang);
    postsAfterTranslate.push({descAfterTranslate , post});
  }
  return res.status(200).json({ message: "success", postsAfterTranslate });
});

export const makeLikes = asyncHandeller(async (req , res , next) => {
  const {status , postId} = req.body;
  const post = await postModel.findById(postId);
  if(!post) {
    return next(new Error('this post is not available now' , {cause:404}));
  }
  const validStatus = ['like' , 'dislike'];
  console.log(status);
  if(!validStatus.includes(status)){
    return next(new Error('enter avalid value like or dislike' , {cause:400}));
  }
  if(status == 'like'){
    if(post.likes.includes(req.user._id)){
      return next(new Error('you already makes like' , {cause : 400}));
    }
    post.likes.push(req.user._id);
    post.likesCounter = post.likes.length;
  }

  if(status == 'dislike'){
    if(!post.likes.includes(req.user._id)){
      return next(new Error('you are not from likers' , {cause : 400}));
    }
    post.likes.splice(post.likes.indexOf(req.user._id) , 1);
    post.likesCounter = post.likes.length;
  }
  await post.save();
  return res.status(200).json({message:'success' , likesCounter:post.likesCounter});
});
