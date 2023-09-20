import connectDB from "../DB/connection.js";
import postsRouter from './modules/posts/posts.router.js';
import { glopalErrorHandelling } from "./utils/errorHandlig.js";
import authRouter from "./modules/auth/auth.router.js";
import userRouter from "./modules/user/user.router.js";
import placeRouter from './modules/places/places.router.js';
import monumentsRouter from "./modules/monuments/monuments.router.js";
import cors from 'cors';
const bootstrap = (app , express) => {
    app.use(express.json());
    app.use(cors());
    app.use('/auth', authRouter);
    app.use('/user', userRouter);
    app.use('/posts' , postsRouter);
    app.use('/places' , placeRouter);
    app.use('/monuments' , monumentsRouter);

    app.use('*' , (req , res , next) => {
        return res.json({message:'in-valid routing'})
    });
    app.use(glopalErrorHandelling);
    connectDB();
}

export default bootstrap ;