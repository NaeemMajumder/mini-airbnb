// Express
const express = require("express");
const app = express();

// EJS
const path = require('path');
app.set("view engin","ejs");
app.set("views",path.join(__dirname,"/views"));

// ejs-mate
const ejsMate = require('ejs-mate');
app.engine('ejs',ejsMate);

// Serving Statice Files (public)
app.use(express.static("public"));
app.use(express.static(path.join(__dirname,"/public")));


// Handling post 
app.use(express.urlencoded({extended:true}));

// Method Override
const methodOverride = require('method-override');
app.use(methodOverride("_method"));

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
const { disconnect } = require("process");

//Root Route
app.get("/",(request,response)=>{
   response.send("work successfully");
});

// Index Route
app.get("/listing",async (request,response)=>{
    let listings = await Listing.find({});

    response.render("listings/index.ejs",{listings});
});

// New Route
app.get("/listing/new",(request,response)=>{
    response.render("listings/new.ejs");
});

// Show Route
app.get("/listing/:id",async (request,response)=>{
    let {id} = request.params;
    let list = await Listing.findById(id);
    response.render("listings/show.ejs",{list});
});

// Create Route
app.post("/listing", async (request,response)=>{
    let {title,description,image,price,location,country} = request.body;

    // console.log(request.body);

    let newList = Listing({
        title:title,
        description:description,
        image:image,
        price:price,
        location:location,
        country:country
    });

    newList.save();

    response.redirect("/listing");
});

// Edit Route
app.get("/listing/:id/edit",async(request,response)=>{
    let {id} = request.params;
    let list = await Listing.findById(id);

    response.render("listings/edit.ejs",{list});
});

app.put("/listing/:id",async (request,response)=>{
    let {id} = request.params;
    let list = await Listing.findByIdAndUpdate(id,{...request.body.listing});
    // console.log(list);
    response.redirect(`/listing/${id}`);
});

// Delete Route
app.delete("/listing/:id",async (request,response)=>{
    let {id} = request.params;
    let deletedList = await Listing.findByIdAndDelete(id);
    console.log(deletedList);
    response.redirect("/listing");
});


// Testing Route
// app.get("/testListing",(request,response)=>{
//     let list1 = new Listing({
//         title:"Bosumoti Vila",
//         description:"In front of sea beach",
//         price:1000,
//         location:"cox's bazar",
//         country:"Bangladesh"
//     });
//     list1.save();
//     console.log(list1);
//     response.send("list successfully saved");
// })



app.listen(8080,()=>{
    console.log("Port 8080 is listening");
});