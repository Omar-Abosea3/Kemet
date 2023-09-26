import multer from "multer";
import allowedEstensions from '../utils/allowedExtensions.js';


const multerFunction = (allowedEstensionsArray) => {
    if(!allowedEstensionsArray){
        allowedEstensionsArray = allowedEstensions.Images;
    }

    const storage = multer.diskStorage({});
    console.log(allowedEstensionsArray);
    const fileFilter = (req , file , cb) => {
        if(!allowedEstensionsArray.includes(file.mimetype)){
            console.log(file.mimetype);
            cb(new Error('invalid extension', { cause: 400 }), false)
        }
        return cb(null , true);
    }

    const fileUpload = multer({fileFilter , storage});

    return fileUpload ;
}

export default multerFunction;