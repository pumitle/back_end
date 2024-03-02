import express  from "express";
import multer from "multer";
import {initializeApp} from "firebase/app";
import {getStorage,ref,uploadBytesResumable,getDownloadURL}  from "firebase/storage";

export const router = express.Router();



const firebaseConfig = {
        apiKey: "AIzaSyDOifdXlReE8CTTUG9MxUIikoS_d3g16U8",
        authDomain: "bestcars-vote.firebaseapp.com",
        projectId: "bestcars-vote",
        storageBucket: "bestcars-vote.appspot.com",
        messagingSenderId: "190989174387",
        appId: "1:190989174387:web:661000c2918d07ece78c06",
        measurementId: "G-4V5Z3G2RT7"
      };
    initializeApp(firebaseConfig);
    const storage = getStorage();

  /// 2. upload file
  
  ///filebase
class FileMiddleware {

    filename = "";

    public readonly diskLoader = multer({

        storage: multer.memoryStorage(),

        limits: {
            fileSize: 67108864, ///64 MByte
        },

    });
}  

//post /upload

// const fileupload = new FileMiddleware();
// router.post("/",fileupload.diskLoader.single("file"), async (req,res)=>{

//     const filename = Date.now()+ "-" + Math.round(Math.random() * 1000)+ ".png";

//     const storageRef = ref(storage,"images/"+ filename);

//     const metadata = {
//         contentType : req.file!.mimetype
//     }

//     const resultsnapshot = await uploadBytesResumable(storageRef,req.file!.buffer,metadata);

//     const url = await getDownloadURL(resultsnapshot.ref);
//     res.sendStatus(200).json({
//         file : url
      
//     });
 

// });

router.get("/",(req,res)=>{
    res.send("sss")
});

const fileupload = new FileMiddleware();

router.post("/", fileupload.diskLoader.single("file"), async (req, res) => {
    try {
        const filename = Date.now() + "-" + Math.round(Math.random() * 1000) + ".png";

        const storageRef = ref(storage, "images/" + filename);

        const metadata = {
            contentType: req.file!.mimetype,
        };

        const resultsnapshot = await uploadBytesResumable(storageRef, req.file!.buffer, metadata);

        const url = await getDownloadURL(resultsnapshot.ref);

        // Send a JSON response with the file URL
        res.status(200).json({
            file: url,
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({
            error: "Internal Server Error",
        });
    }
});
