var express = require('express');
var router  = express.Router();
var Campground  = require('../models/campground');
var Comment     = require('../models/comment');
var middleware  = require('../middleware');

// new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

// show all campgrounds
router.get("/", function(req, res){
    // get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log("Error retrieving Campgrounds from DB");
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds, currentUser: req.user});
        }
    });
    
});

// show specific campground
router.get("/:id", function(req, res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground not found!");
            res.redirect("/campgrounds");
        } else {
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
    
});

// create campground
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to campground array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var description = req.body.description;
    var location = req.body.location;
    var lng = req.body.lng;
    var lat = req.body.lat;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCamp =  {
        name: name, 
        price: price, 
        image: image, 
        description: description, 
        location: location,
        lng: lng,
        lat: lat,
        author: author}
    Campground.create(newCamp, function(err, camp){
        if(err){
            console.log(err);
        } else {
            console.log("Campground added");
        }
    });
    // redirect to campgrounds page
    res.redirect("/campgrounds");
});

// Edit campground
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});
// Update campground
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndUpdate(req.params.id, req.body.camp, function(err, updatedCamp){
        if(err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// Delete campground route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            req.flash("error", "Error when finding campground to be removed.");
            res.redirect("back");
        } else {
            //console.log(foundCampground);
            Comment.remove({_id: {$in: foundCampground.comments}}, function(err){
                if(err){
                    req.flash("error", "Error when removing comments from campground.");
                    res.redirect("back");
                } else {
                    foundCampground.remove(function(err){
                        if(err){
                            req.flash("error", "Error when removing campground.");
                            res.redirect("back");
                        } else {
                            req.flash("success", "Campground and associated comments successfully removed.");
                             res.redirect("/campgrounds");
                        }
                    })
                }
            })
        }
    });
});

module.exports = router;