const express = require('express');
const multer = require('multer');
const path = require('path');
const uuid = require('uuid/v1');

const router = express.Router();

 // Set stoarge
 const storage = multer.diskStorage({
    destination: function( req, file, cb) {
        cb(null, './public/image')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + uuid() + path.extname(file.originalname));
    }
});

// Init Upload
const upload = multer({
    storage: storage
    // fileFilter: function(req, file, cb){
    //     checkFileType(file, cb);
    // }
}).single('image');

function checkFileType(file, cb){
    const filetype = /jpeg|jpg|png/;
    const extname = filetype.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetype.test(file.mimetype);

    if( extname && mimetype) {
        return cb(null, true);
    } else {
        cb('error: image only!');
    }
}

router.post('/', function(req, res) {
    upload( req, res, function (err) {
        if (err) {
            console.log( err );
            return res.send({"error": err });
        }
        if( req.file == undefined ){
            return res.send({"error": "No File Selected"});
        }else{
            console.log(req.file);
            res.send({
                data:{
                    filename: req.file.filename,
                    path: req.file.path
                }
            })
        }
    })
});

module.exports = router;
