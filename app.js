//Upload Image test Application
/***** GLOBAL IMPORTS *****/
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const multer = require("multer");
app.use("/uploads" , express.static('uploads'));
const storage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,"./uploads/");
    },
    filename : function(req,file,cb){
        let extension = file.mimetype.slice(file.mimetype.length - 4,file.mimetype.length);
        let name = file.originalname.slice(0,file.originalname.length - 3);
        console.log(name+extension);
        cb(null,name+extension);
    }
})
const fileFilter = (req,file,cb)=>{
    if(file.mimetype==='image/jpeg'||file.mimetype==='image/png'){
        cb(null,true);
    }else{
        cb(new Error('the file extension is not valide'),false);
    }

    };
const upload = multer ({storage : storage, limits : {
    fileSize : 1024*1024*5
},fileFilter:fileFilter});

mongoose.connect("mongodb://localhost:27017/myapp");
const imageSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name:String,
    image:String
})
const Image = mongoose.model("Image",imageSchema);

/***** UTILS CONFIG *****/
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Home Route
app.get("/",(req,res)=>{
    res.send("Welcome to upload image");
});
//Getting all images route
app.get("/image",(req,res)=>{
    const images = Image.find({}).then(results=>{
        res.status(200).json(results);
    }).catch(err=>{
        res.status(500).json({error:err.message});
    })
})
//Posting an Image Route
app.post("/image",upload.single('image'),(req,res)=>{
    console.log(req.file);
    //preparing Image Link on LocalHost mongo Database
    var imageLink = req.file.path;
    imageLink = "http://localhost:8080/"+imageLink.slice(0,7)+"/"+imageLink.slice(8,imageLink.length);
    console.log(imageLink);
    //Creating image object with name and image link attributes
    const image = new Image({
        _id : new mongoose.Types.ObjectId(),
        name : req.body.name,
        image : imageLink
    });
     //Saving the image object to database
    image.save().then(result =>{
        console.log(result)
        res.status(200).json(result);
    }).catch(err=>{
        res.status(500).json({error:err.message});
    })
})

app.listen(8080,()=>{
    console.log("listening to port "+8080);
});