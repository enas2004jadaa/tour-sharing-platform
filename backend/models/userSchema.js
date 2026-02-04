const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userModel = new mongoose.Schema({
    firstName : {type: String, require : true},
    lastName : {type : String, require: true},
    image : {type : String, default : "https://i.ibb.co/HDy0pBt/user-1.png"},
    dataBirth : {type : String, require: true},
    phoneNumber : {type : Number},
    county : {type: String},
    bio : {type:String},
    gender : {type: String, require: true},
    email : {type : String, require: true, unique: true},
    password : {type: String, require : true},
    tour : [{type: mongoose.Schema.Types.ObjectId, ref: "Tour"}],
    role: { type : String, enum: ['user', 'admin', 'moderator'], default: 'user'},
    savedTours : [{type: mongoose.Schema.Types.ObjectId, ref: "Tour"}],
    isDeleted : { type: Boolean, default: false },
    createdAt : {type : Date, default : Date.now},
});
userModel.pre("save", async function () {
    this.email = this.email.toLowerCase();
    this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("User", userModel);