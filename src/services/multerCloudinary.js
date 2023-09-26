import multer from "multer";
import allowedEstensions from '../utils/allowedExtensions.js';


const multerFunction = (allowedEstensionsArray) => {
    if(!allowedEstensionsArray){
        allowedEstensionsArray = allowedEstensions.Images;
    }

    const storage = multer.diskStorage({});
    console.log(allowedEstensions);
    const fileFilter = (req , file , cb) => {
        console.log(file.mimetype);
        if(!allowedEstensionsArray.Images.includes(file.mimetype)){
            cb(new Error('invalid extension', { cause: 400 }), false)
        }
        return cb(null , true);
    }

    const fileUpload = multer({fileFilter , storage});

    return fileUpload ;
}

export default multerFunction;