var Campground  = require('../models/campground');
var Comment     = require('../models/comment');
// all the middleware goes here
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next){
    // is User logged in
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err){
                req.flash("error", "Campground not found");
                res.redirect("back"); 
            } else {
                // does user own the campground entry? compare logged in user id with campground.author id
                // use built-in mongoose .equals function to compare IDs because you would compare objectID to string 
                if (foundCampground.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error", "No permissions to do that!");
                    res.redirect("back"); 
                }
            }
        });
    } else {
        req.flash("error", "You need to login!")
        res.redirect("back"); 
    }   
};

middlewareObj.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comments_id, function(err, foundComment){
            if(err){
                console.log(err);
                res.redirect("back"); 
            } else {
                // does user own the comment? compare logged in user id with comment.author id
                // use built-in mongoose .equals function to compare IDs because you would compare objectID to string 
                if (foundComment.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error", "No permission to do that.");
                    res.redirect("back"); 
                }
            }
        });
    } else {
        req.flash("error", "You need to login!");
        res.redirect("back"); 
    }   
};

middlewareObj.isLoggedIn = function (req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to login first.")
    res.redirect("/login");
};

module.exports = middlewareObj;