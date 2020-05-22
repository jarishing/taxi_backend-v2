const mongoose = require("mongoose"),
      crypto   = require("crypto"),
      jwt      = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    type            : { type: String, required: true, unique: false },
    data            : {
        email       : String
    },
    // email           : String,
    username        : { type: String, required: true },
    // telephone_no    : { type: String, unique: true },
    telephone_no    : { type: String, required: true, unique: false },
    hash            : String,
    salt            : String,
    grade           : { type: String, default: 'C', enum: [ 'S', 'A', 'B', 'C', 'D', 'E' ] },
    mark            : { type: Number, default: 50 },
    valid           : { type: Boolean, default: false },
    ban             : { type: Boolean, default: false }
}, { timestamps: true, strict: false });

userSchema.index({type:1,telephone_no:1},{unique:true});

userSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, process.env.DIGEST_NAME).toString('hex');
};

userSchema.methods.validPassword = function (password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, process.env.DIGEST_NAME).toString("hex");
    return this.hash == hash;
};

userSchema.methods.generateJwt = function () {
    return jwt.sign(this._doc, process.env.SECRET_KEY);
};

userSchema.statics.create = function( doc, password ){
    let userDoc = new this(doc);
    userDoc.setPassword( password );
    return userDoc.save();
};

const User = mongoose.model("User", userSchema);

module.exports = User;



// ( async _ => {

//     let newUser = new User({
//         telephone_no        : '999',
//         email               : 'admin@admin.com',
//         username            : 'admin',
//         type: 'admin'
//     });
//     newUser.setPassword( '123');
//     newUser = await newUser.save();

// })();