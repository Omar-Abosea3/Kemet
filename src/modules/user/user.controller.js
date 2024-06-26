import { nanoid } from "nanoid";
import userModel from "../../../DB/models/userModel.js";
import cloudinary from "../../utils/cloudinaryConfigration.js";
import { asyncHandeller } from "../../utils/errorHandlig.js";
import postModel from "../../../DB/models/postModel.js";

export const addProfilePicture = asyncHandeller(async (req, res, next) => {
  const user = await userModel.findById(req.user._id);
  if (!req.file) {
    return next(new Error("you must upload a photo", { cause: 400 }));
  }
  if (!user.customId) {
    const customId = nanoid();
    const { public_id , secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.PROJECT_FOLDER}/Users/${customId}`,
      }
    );
    req.imagePath = `${process.env.PROJECT_FOLDER}/Users/${customId}`;
    user.profile_pic = { secure_url, public_id };
    user.customId = customId;
    await user.save();
  }
  await cloudinary.api.delete_resources_by_prefix(
    `${process.env.PROJECT_FOLDER}/Users/${user.customId}`
  );
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.PROJECT_FOLDER}/Users/${user.customId}`,
    }
  );
  req.imagePath = `${process.env.PROJECT_FOLDER}/Users/${user.customId}`;
  user.profile_pic = { secure_url, public_id };
  await user.save();
  return res.status(200).json({ message: "done", user });
});

export const getAllUsers = asyncHandeller(async (req, res, next) => {
  const users = await userModel.find();
  if (users.length == 0) {
    return next(new Error("no users found" , { cause: 403 }));
  }
  return res.status(200).json({ message: "success", users });
});

export const deleteUser = asyncHandeller(async (req, res, next) => {
  const { id } = req.query;
  let deletedUser;
  let deletedPosts;
  if (id) {
    if (req.user.role != "SuperAdmin") {
      return next(new Error("you not have permission to do this", { cause: 403 }));
    }
    if(await userModel.findById(id).role == "SuperAdmin"){
      return next(new Error("you not have permission to do this", { cause: 403 }));
    }
    posts = await postModel.find({createdBy:id});
    deletedUser = await userModel.findByIdAndDelete(id);
    await cloudinary.api.delete_resources_by_prefix(`${process.env.PROJECT_FOLDER}/Users/${deletedUser.customId}`);
    await cloudinary.api.delete_folder(`${process.env.PROJECT_FOLDER}/Users/${deletedUser.customId}`);
    req.imagePath = `${process.env.PROJECT_FOLDER}/Users/${deletedUser.customId}`;
    deletedPosts = await postModel.deleteOne({createdBy:id});
    if(posts.length){
      const publicIds = [];
      const customIds =[];
      for (const post of posts) {
        customIds.push(post.customId);
        for (const postimage of post.images) {
          publicIds.push(postimage.public_id);
        }
      }
      await cloudinary.api.delete_resources(publicIds);
      for (const customId of customIds) {
        await cloudinary.api.delete_folder(
          `${process.env.PROJECT_FOLDER}/Posts/${customId}`
        );
      }
    }
  }
  posts = await postModel.find({createdBy:req.user._id});
  deletedUser = await userModel.findByIdAndDelete(req.user._id);
  await cloudinary.api.delete_resources_by_prefix(`${process.env.PROJECT_FOLDER}/Users/${deletedUser.customId}`);
  await cloudinary.api.delete_folder(`${process.env.PROJECT_FOLDER}/Users/${deletedUser.customId}`);
  req.imagePath = `${process.env.PROJECT_FOLDER}/Users/${deletedUser.customId}`;
  deletedPosts = await postModel.deleteOne({createdBy:req.user._id});
  if(posts.length){
    const publicIds = [];
    const customIds =[];
    for (const post of posts) {
      customIds.push(post.customId);
      for (const postimage of post.images) {
        publicIds.push(postimage.public_id);
      }
    }
    await cloudinary.api.delete_resources(publicIds);
    for (const customId of customIds) {
      await cloudinary.api.delete_folder(
        `${process.env.PROJECT_FOLDER}/Posts/${customId}`
      ); 
    }
  }
  return res.status(200).json({ message: "deleted success", deletedUser , deletedPosts });
});

export const updateProfile = asyncHandeller(async (req, res, next) => {
  const { age, phone, firstName, lastName } = req.body;
  const user = await userModel.findById(req.user._id);
  if (age) {
    if (age < 14) {
      return next(new Error("this age not permited in our site", { cause: 400 }));
    };
    if (user.age == age) {
      return next(new Error("your age is same with your old one", { cause: 400 }));
    }
    user.age = age;
  }
  if (phone) {
    if (user.phone == phone) {
      return next(
        new Error("this number is already used by you", { cause: 400 })
      );
    }
    if (await userModel.findOne({ phone })) {
      return next(
        new Error("this number is already used by another account", {
          cause: 400,
        })
      );
    }
    user.phone = phone;
  }
  if (firstName) {
    if (user.firstName == firstName) {
      return next(
        new Error("your first name is same with your old one", { cause: 400 })
      );
    }
    user.firstName = firstName;
    user.userName = firstName + ' ' + user.lastName; 
  }
  if (lastName) {
    if (user.lastName == lastName) {
      return next(
        new Error("your last name is same with your old one", { cause: 400 })
      );
    }
    user.lastName = lastName;
    user.userName = user.firstName + ' ' + lastName; 
  }

  if(lastName && firstName){
    if (user.firstName == firstName || user.lastName == lastName) {
      return next(
        new Error("your first name and last name is same as your old one", { cause: 400 })
      );
    }
    user.userName = firstName + ' ' + lastName;
  }
  await user.save();
  return res.status(200).json({ message: "updated done", user });
});

export const getProfileInfo = asyncHandeller(async (req, res, next) => {
  const {id} = req.params;
  if(req.user._id.toString() == id.toString()){
    const profileData = await userModel.findById(id);
    return res.status(200).json({ message: "success", profileData });
  }
  const profileData = await userModel.findById(id).select('-password email -OTP -isConfirmEmail -isLoggedIn -isDeleted');
  return res.status(200).json({ message: "success", profileData });
});

export const searchForUsers = asyncHandeller(async (req, res, next) => {
  const { searchKey } = req.query;
  const {role} = req.user;

  if(role == 'SuperAdmin'){
  const users = await userModel.find({
    $or: [
      { email: { $regex: searchKey, $options: "i" } },
      { firstName: { $regex: searchKey, $options: "i" } },
      { lastName: { $regex: searchKey, $options: "i" } },
      { gender: { $regex: searchKey, $options: "i" } },
    ],
  });
  console.log(users);
  if (users.length == 0) {
    return next(new Error("no users found" , {cause:404}));
  }
  return res.status(200).json({ message: "success", users });
  }
  return next(new Error("you not have permission to do this" , { cause: 403 }));
});

export const logOutUser = asyncHandeller(async (req , res , next) => {
  const user = await userModel.findByIdAndUpdate(req.user._id , {status:'offline' , isLoggedIn:false });
  return res.status(200).json({message:'success logging out'});
});