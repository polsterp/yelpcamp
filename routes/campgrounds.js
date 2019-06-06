var express = require('express');
var router  = express.Router();
var Campground  = require('../models/campground');
var Comment     = require('../models/comment');
var middleware  = require('../middleware');
var multer      = require('multer');
var cloudinary  = require('cloudinary');
require('dotenv').config();

var storage = multer.diskStorage({
    filename: function (req, file, cb) {
      cb(null, Date.now() + "_" + file.fieldname)
    }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
}

var upload = multer({storage: storage, fileFilter: imageFilter});

cloudinary.config({ 
  cloud_name: process.env.CLOUDNAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});
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
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res){
    // get data from form and add to campground array
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
        if(err){
            console.log(err);
            console.log(result);
            req.flash("error", "something went wrong with uploading the image");
            return res.redirect("/campgrounds");
        }
        // add cloudinary url for the image to the campground object under image property
        req.body.camp.image = result.secure_url;
        // get image_id to be able to delete the uploaded picture again later if needed
        req.body.camp.imageId = result.public_id;
        // add author to campground
        req.body.camp.author = {
          id: req.user._id,
          username: req.user.username
        }
    Campground.create(req.body.camp, function(err, camp){
        if(err){
            console.log(err);
        } else {
            console.log("Campground added");
        }
    });
    // redirect to campgrounds page
    res.redirect("/campgrounds");
    });
});

// Edit campground
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});
// Update campground
router.put("/:id", middleware.checkCampgroundOwnership, upload.single('image'), function(req, res){
    Campground.findById(req.params.id, async function(err, foundCampground){
        if(err){
            req.flash("error", "Campground not found!");
            res.redirect("/campgrounds");
        } else {
            if(req.file){
                try {
                    await cloudinary.v2.uploader.destroy(foundCampground.imageId);
                    var result = await cloudinary.v2.uploader.upload(req.file.path);
                    req.body.camp.image = result.secure_url;
                    req.body.camp.imageId = result.public_id;
                } catch(err) {
                    req.flash("error", "Error while updating image!");
                    return res.redirect("/campgrounds");
                } 
            }
            Campground.findByIdAndUpdate(req.params.id, req.body.camp, async function(err, foundCampground){
                if(err){
                    req.flash("error", "Campground not found!");
                    res.redirect("/campgrounds");
                } else {
                    res.redirect("/campgrounds/" + req.params.id);
                }
            });
        }
    });
});

// Delete campground route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, async function(err, foundCampground){
        if(err){
            req.flash("error", "Error when finding campground to be removed.");
            return res.redirect("back");
        } else {
            try {
                await cloudinary.v2.uploader.destroy(foundCampground.imageId);
                console.log("Image deleted from cloud");
            } catch(err) {
                req.flash("error", "Error while deleting image from cloud.");
                return res.redirect("back");
            }
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