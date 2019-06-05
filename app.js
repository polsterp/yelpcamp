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
    
var port =  process.env.PORT || 3000;
var url =   process.env.DATABASEURL || "mongodb://localhost:27017/yelp_camp_2"

mongoose.connect(url)
.then(() => {
    console.log("Connected to DB!");
}).catch(err => {
    console.log("Error:", err.message);
});
// mongoose.connect('mongodb+srv://polsterp:yPXWWZRtj5WVBQS@cluster0-vrbgs.mongodb.net/test?retryWrites=true&w=majority', {
//     useNewUrlParser: true,
//     useCreateIndex: true
// }).then(() => {
//     console.log("Connected to DB!");
// }).catch(err => {
//     console.log("Error:", err.message);
// });
app.use(bodyParser.urlencoded({extended: true}));
// Define the default path for public like stylesheets
app.use(express.static(__dirname + "/public"));
// use method override
app.use(methodOverride("_method"));
// all rendered files are assumed to be .ejs files
app.set("view engine", "ejs");
// use connect-flash package
app.use(flash());

app.locals.moment = require('moment');
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
app.listen(port, function(){
    console.log("Server running on 3000");
})