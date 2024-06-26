import dotenv from 'dotenv';
import express from 'express';
import bootstrap from './src/index.router.js';
import path from 'path';
import { refreshCharitiesServer, refreshEcommerceServer, removeNonConfirmedAccount } from './src/utils/crons.js';

dotenv.config({path:path.resolve('./configs/.env')});
const app = express();
const port = 5000;
removeNonConfirmedAccount();
bootstrap(app , express);
app.listen(parseInt(process.env.PORT) || port , _=>{console.log(`running on .... ${parseInt(process.env.PORT)}`)});
