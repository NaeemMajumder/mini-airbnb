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

// Review Schema
const Review = require("./models/review.js");

// Wrap Async Function
const wrapAsync = require('./utils/wrapAsync.js');

// Express Class Error
const ExpressError = require("./utils/ExpressError.js");
const { stat } = require("fs");

// Listing Schema (Joi) and Review Schema (Joi)
const {listingSchema , reviewSchema} = require("./schema.js");
const { resolveNaptr } = require("dns");

// Schema validation middleware
const validateListing = (request,response,next)=>{
    let result = listingSchema.validate(request.body);
    console.log(result);
    if(result.error){
        let errMsg = result.error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,result.error);
    }else{
        next();
    }
}

// Review validation middleware
const validateReview = (request,response,next)=>{
    let result = reviewSchema.validate(request.body);
    console.log(result);
    if(result.error){
        let errMsg = result.error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,result.error);
    }else{
        next();
    }
}

//Root Route
app.get("/",(request,response)=>{
   response.send("work successfully");
});

// Index Route
app.get("/listing",wrapAsync(async (request,response)=>{
    let listings = await Listing.find({});

    response.render("listings/index.ejs",{listings});
}));

// New Route
app.get("/listing/new",(request,response)=>{
    response.render("listings/new.ejs");
});

// Show Route
app.get("/listing/:id",wrapAsync(async (request,response)=>{
    let {id} = request.params;
    let list = await Listing.findById(id).populate("reviews");
    response.render("listings/show.ejs",{list});
}));

// Create Route
app.post("/listing",async (request,response,next)=>{
    try{
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
        await newList.save();
        response.redirect("/listing");
    }catch(error){
        next(error);
    }
});

// Edit Route
app.get("/listing/:id/edit", wrapAsync(async(request,response)=>{
    let {id} = request.params;
    let list = await Listing.findById(id);

    response.render("listings/edit.ejs",{list});
}));

app.put("/listing/:id",validateListing ,wrapAsync(async (request,response)=>{
    let {id} = request.params;
    let list = await Listing.findByIdAndUpdate(id,{...request.body.listing});
    console.log(list);
    response.redirect(`/listing/${id}`);
}));

// Delete Route
app.delete("/listing/:id",wrapAsync(async (request,response)=>{
    let {id} = request.params;
    let deletedList = await Listing.findByIdAndDelete(id);
    console.log(deletedList);
    response.redirect("/listing");
}));

// Reviews Route
// Post Route
app.post("/listing/:id/reviews",validateReview, wrapAsync(async(request,response)=>{
    let listing = await Listing.findById(request.params.id);

    let newReview = new Review(request.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    console.log("New review saved");

    response.redirect(`/listing/${listing._id}`);
}));

// Delete Review Route
app.delete("/listing/:id/reviews/:reviewId",wrapAsync(async(request,response)=>{
    let {id, reviewId} = request.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);

    response.redirect(`/listing/${id}`);
}));

app.all("*",(request,response,next)=>{
    next(new ExpressError(404, "Page not found!"));
});


app.use((error,request,response,next)=>{
    let {statusCode=500, message="Something went wrong!"} = error;
    response.status(statusCode).render("error.ejs",{message});
    // response.status(statusCode).send(message);
    // response.send("Something Went wrong");
});

app.listen(8080,()=>{
    console.log("Port 8080 is listening");
});