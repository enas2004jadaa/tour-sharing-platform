const mongoose = require("mongoose");

mongoose.connect(process.env.DB_URI).then((result) => {
    console.log("DB Ready To Use");
}).catch((err) => {
    console.log(err);
});