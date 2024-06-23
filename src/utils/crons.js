import axios from "axios";
import { scheduleJob } from "node-schedule";
import userModel from "../../DB/models/userModel.js";


export const removeNonConfirmedAccount = () => {
    scheduleJob('*/5 * * * *', async () => {
        try {
            const users = await userModel.find({ isConfirmEmail: false });
            const deletedUsers = [];
            const now = new Date();
            const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60000); // Date 30 minutes ago

            for (const user of users) {
                if (new Date(user.createdAt) < thirtyMinutesAgo) { // Compare with the date 30 minutes ago
                    await userModel.findByIdAndDelete(user._id);
                    deletedUsers.push(user._id);
                }
            }

            console.log(`${deletedUsers.length} non-confirmed accounts deleted.`);
        } catch (error) {
            console.log('No non-confirmed accounts found.');
        }
    });
};

export const refreshCharitiesServer = () => {
    scheduleJob('*/15 * * * *', async () => {
        try {
            const {data} = await axios.get(`https://charities-donations.onrender.com`);
            console.log(data);
        }catch(error){
            console.log("error");
        }
    })
}

export const refreshEcommerceServer = () => {
    scheduleJob('*/15 * * * *', async () => {
        try {
            const {data} = await axios.get(`https://ecommerce-rby0.onrender.com`);
            console.log(data);
        }catch(error){
            console.log("error");
        }
    })
}