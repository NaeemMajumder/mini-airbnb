// Express
const express = require("express");
const app = express();

// Mongoose
const mongoose = require('mongoose');
main().then((result)=>{
    console.log("connected with mongodb successfully");
})
.catch((error)=>{
    console.log(error);
});
async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/mini-airbnb');
}

// Listing Schema
const Listing = require('./models/listing.js');

//Root Route
app.get("/",(request,response)=>{
   response.send("work successfully");
});




app.listen(8080,()=>{
    console.log("Port 8080 is listening");
});