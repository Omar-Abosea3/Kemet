import userModel from "../../../DB/models/userModel.js";
import sendEmail from "../../utils/email.js";
import { asyncHandeller } from "../../utils/errorHandlig.js";
import bcryptjs from "bcryptjs";
import jwt from 'jsonwebtoken';
import generateOTPFunction from "../../utils/generateOTP.js";

export const signUp = asyncHandeller(async(req , res , next) => {
    const {firstName , lastName , email , password , repassword , phone , age , gender , role} =req.body;
    if(password !== repassword){
        return next(new Error('password and repassword not matched', {cause:400}));
    }
    if(age < 14){
        return next(new Error('You are so young' , {cause : 400}));
    }
    const findUser = await userModel.findOne({$or:[{email} , {phone}]});
    if(findUser){
        return next(new Error('user already exists or have the same phone number' , {cause:409}));
    }
    const userName = firstName + ' ' + lastName;
    const hashPassword = bcryptjs.hashSync(password , parseInt(process.env.NUMOFHASH));
    const user = await userModel.create({firstName , lastName , userName , email , password:hashPassword ,  phone , age , gender , role });
    sendEmail({to:user.email , subject:"Kemet" ,text:'success signUp , please virefy your email with otp'})
    return res.status(200).json({message:'success' , user});
});

export const generateOTP = asyncHandeller(async(req , res , next) => {
    const { email } = req.body;
    const user = await userModel.findOne({email});
    if(!user){
        return next(new Error('this user is not found' , {cause:404}));
    }
    if(user.isConfirmEmail){
        return next(new Error('this user is already confirmed his email' , {cause:400}));
    }
    const OTP = await generateOTPFunction();
    user.OTP = OTP;
    await user.save();
    sendEmail({to:user.email , subject:"Kemet" , text : `your OTP code is ${OTP}`});
    return res.status(201).json({message:'email founded and your OTP is generated' , userId : user._id});
});

export const confirmEmail = asyncHandeller(async (req , res , next) => {
    const {OTP , id} = req.body;
    if(!OTP){
        return next(new Error('OTP is required' , {cause:400}))
    }
    const user = await userModel.findOne({_id:id ,OTP});
    if(!user){
        return next(new Error('invalid OTP' , {cause:404}))
    }
    if(user.isConfirmEmail){
        return next(new Error('you are already confirmed' , {cause:400}))
    }
    user.isConfirmEmail = true;
    user.OTP=null;
    await user.save();
    return res.status(200).json({message:'done,you can signin now!' , user});
});

export const unsupscribeEmail = asyncHandeller(async(req , res , next) => {
    const {OTP , id} = req.body;
    if(!OTP){
        return next(new Error('OTP is required' , {cause:400}))
    }
    if((await userModel.findById(id)).isConfirmEmail){
        return next(new Error('you are already confirmed , if you want to delete your account enter to your personal setting' , {cause:400}))
    }
    const user = await userModel.findByIdAndDelete(id , {OTP});
    if(!user){
        return next(new Error('invalid OTP' , {cause:404}))
    }
    return res.status(200).json({message:'success unSubscription'});
});

export const forgetPassword = asyncHandeller(async(req , res , next) => {
    const {OTP , id} = req.body;
    if(!OTP){
        return next(new Error('OTP is required' , {cause:400}))
    }
    const user = await userModel.findById(id ,{OTP});
    if(!user){
        return next(new Error('invalid OTP' , {cause:404}))
    }
    if(!user.isConfirmEmail){
        return next(new Error('you must confirm your email first' , {cause:400}))
    }
    await user.save();
    return res.status(200).json({message:'done,you can reset your password now' , user});
});

export const resetPassword = asyncHandeller(async(req , res , next) => {
    const {id} = req.params;
    const { password , repassword , OTP } = req.body;
    if(password != repassword){
        return next(new Error('password and repassword is not matched' , {cause:400}));
    }
    const user = await userModel.findById(id , {OTP});
    if(!user){
        return next(new Error('this user is not found or not have this OTP Code' , {cause:404}));
    }
    const hashPassword = bcryptjs.hashSync(password , parseInt(process.env.NUMOFHASH));
    user.password = hashPassword;
    user.OTP = null;
    return res.status(200).json({message:'success , you can login by new password now'});
});

export const signIn = asyncHandeller(async(req , res , next) => {
    const {email , password } = req.body;
    const user = await userModel.findOneAndUpdate({email} ,{isLoggedIn:true} , {new:true});
    if(!user){
        return next(new Error('user dosn’t exists' , {cause:404}));
    }
    const hashPassword = bcryptjs.compareSync(password , user.password);
    if(!hashPassword){
        return next(new Error('in-valid user data' , {cause:400}))
    }
    if(user.isDeleted){
        return next(new Error("this account has been deleted" ,{ cause : 400}))
    }
    if(!user.isConfirmEmail){
        return next(new Error('you must confirm new account first' , {cause:400}))
    }
    const token = jwt.sign({email:user.email , id:user._id , isLoggedIn:true} , process.env.TOKEN_SECRET , {expiresIn:'24h'});
    user.token = token;
    user.status = 'online';
    await user.save();
    const bearerToken = process.env.BEARERKEY + token ;
    return res.status(201).json({message:'success' , user , bearerToken});
});