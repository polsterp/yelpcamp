var express = require('express');
var router  = express.Router({mergeParams: true});
var Campground  = require('../models/campground');
var Comment     = require('../models/comment');
var middleware  = require('../middleware');

// new comment
router.get("/new", middleware.isLoggedIn, function(req, res){

    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            res.render("comments/new", {campground: foundCampground});
        }
    });
});

// create comment
router.post("/", middleware.isLoggedIn, function(req, res){
    //look up campground with ID
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
            //create new comment
            Comment.create(req.body.comment, function(err, createdComment){
                if(err){
                    console.log(err);
                } else {
                //add username and id to comment
                createdComment.author.id = req.user._id;
                createdComment.author.username = req.user.username;
                //save comment
                createdComment.save();
                //connect new comment to campground
                campground.comments.push(createdComment);
                campground.save(function(err){
                    if(err){
                        console.log(err);
                    } else {
                        //redirect to campground show page
                        req.flash("success", "Comment added!");
                        res.redirect("/campgrounds/" + campground._id);
                    }
                });
                }
            })
        }
    });
});

// Edit comment route
router.get("/:comments_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comments_id, function(err, foundComment){
        if(err || !foundComment){
            req.flash("error", "Comment not found!");
            res.redirect("/campgrounds");
        } else {
            res.render("comments/edit", {onlyCampgroundId: req.params.id, comment: foundComment});
        }
    })
    
});

// Update comment route
router.put("/:comments_id", middleware.checkCommentOwnership, function(req, res){
    // find comment and update 
    Comment.findByIdAndUpdate(req.params.comments_id, req.body.comment, function(err, updatedComment){
        if(err || !updatedComment){
            req.flash("error", "Comment not found!");
            res.redirect("/campgrounds");
        } else {
            // redirect to campground
            res.redirect("/campgrounds/" + req.params.id);
        }
    }); 
});

// Delete Comment route
router.delete("/:comments_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comments_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment removed!");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;