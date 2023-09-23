import  jwt  from "jsonwebtoken";
import userModel from "../../DB/models/userModel.js";
import { asyncHandeller } from "../utils/errorHandlig.js";

const authentication = (roles) => {
  return asyncHandeller(async ( req , res , next) => {
          const {token} = req.headers;
          if(!token){
              return next(new Error('not authenticated user or in-valid bearer key' , {cause:401}));
          }
          const decoded = jwt.verify(token , process.env.TOKEN_SECRET);
          if(!decoded?.id){
              return next(new Error('in-valid token payload' , {cause:400}));
          }
          const user = await userModel.findById(decoded.id);
          if(!user){
              return next(new Error('user not found' , {cause:404}))
          }
          if(!user.isLoggedIn){
              return next(new Error('you are not logged in , please log in first' , {cause:400}))
          }
          if(!roles.includes(user.role)){
            return next(new Error('unAuthorized to access this api' , {cause:401}));
          }
          req.user = user;
          return next();   
  })
};

export default authentication;