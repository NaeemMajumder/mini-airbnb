const mongoose = require('mongoose');
const initData = require("./data.js");

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
const Listing = require('../models/listing.js');

const Data = async ()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("data insert successfully");
}

Data();

