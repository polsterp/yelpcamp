var express     = require('express'),
    app         = express(),
    bodyParser  = require('body-parser'),
    mongoose    = require('mongoose'),
    flash       = require('connect-flash');
    passport    = require('passport'),
    LocalStrategy = require('passport-local'),
    methodOverride = require('method-override'),
    Campground  = require('./models/campground'),
    Comment     = require('./models/comment'),
    User        = require('./models/user'),
    seedDB      = require('./seeds');

var commentRoutes    = require('./routes/comments'),
    campgroundRoutes = require('./routes/campgrounds')
    indexRoutes      = require('./routes/index');    

mongoose.connect('mongodb://localhost:27017/yelp_camp_2');
app.use(bodyParser.urlencoded({extended: true}));
// Define the default path for public like stylesheets
app.use(express.static(__dirname + "/public"));
// use method override
app.use(methodOverride("_method"));
// all rendered files are assumed to be .ejs files
app.set("view engine", "ejs");
// use connect-flash package
app.use(flash());

//Check if we are connected
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(err) {
    if(err){
        console.log(err);
    } else {
        console.log("Connected to DB!");
        //seedDB();
    }
});
// Passport Config
app.use(require("express-session")({
    secret: "Flora is cuter",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// pass user information to every route
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// use app routes
app.use("/campgrounds/:id/comments",commentRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use(indexRoutes);

// ============================================
// Server Start
// ============================================
app.listen(3000, function(){
    console.log("Server running on 3000");
})