var express     = require('express'),
    app         = express(),
    bodyParser  = require('body-parser'),
    mongoose    = require('mongoose'),
    Campground  = require('./models/campground');
    seedDB      = require('./seeds')

mongoose.connect('mongodb://localhost:27017/yelp_camp', {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//Check if we are connected
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(err) {
    if(err){
        console.log(err);
    } else {
        console.log("Connected to DB!");
        seedDB();
    }
  
});


// not really sure what this does but we always need it

// Define the default path for public like stylesheets
app.use(express.static("public"));
//all rendered files are assumed to be .ejs files



app.get("/", function(req,res){
    res.render("landing");
});

app.get("/campgrounds/new", function(req, res){
    res.render("new");
});

app.get("/campgrounds", function(req, res){
    // get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log("Error retrieving Campgrounds from DB");
        } else {
            res.render("index", {campgrounds: allCampgrounds});
        }
    });
    
});

app.get("/campgrounds/:id", function(req, res){
    console.log(mongoose.Types.ObjectId.isValid(req.params.id));
    Campground.findOne({ _id: req.params.id}, function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            console.log(foundCampground);
            res.render("show", {campground: foundCampground});
        }
    });
    
});

app.post("/campgrounds", function(req, res){
    // get data from form and add to campground array
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    Campground.create(
        {name: name, image: image, description: description}
        , function(err, camp){
        if(err){
            console.log(err);
        } else {
            console.log("Campground added");
        }
    });
    // redirect to campgrounds page
    res.redirect("/campgrounds");
});

// ============================================
// Server Start
// ============================================
app.listen(3000, function(){
    console.log("Server running on 3000");
})