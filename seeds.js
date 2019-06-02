var mongoose    = require('mongoose');
var Campground  = require('./models/campground');
var Comment     = require('./models/comment');

var data = [
    {
        name: "Cloud's Rest", 
        image: "https://farm4.staticflickr.com/3795/10131087094_c1c0a1c859.jpg",
        description: "Bacon ipsum dolor amet strip steak pork belly beef salami pig pancetta. Tail shank drumstick ham hock meatloaf ball tip tri-tip brisket salami ground round. Brisket leberkas beef ribs turducken tenderloin cow bacon chicken bresaola meatloaf tri-tip rump drumstick. Turducken shank chuck brisket spare ribs pork belly pork chop t-bone. Meatball jowl buffalo short loin. Spare ribs pork belly shoulder, flank beef chicken meatball jowl."    },
    {
        name: "Desert Mesa", 
        image: "https://farm6.staticflickr.com/5487/11519019346_f66401b6c1.jpg",
        description: "Bacon ipsum dolor amet strip steak pork belly beef salami pig pancetta. Tail shank drumstick ham hock meatloaf ball tip tri-tip brisket salami ground round. Brisket leberkas beef ribs turducken tenderloin cow bacon chicken bresaola meatloaf tri-tip rump drumstick. Turducken shank chuck brisket spare ribs pork belly pork chop t-bone. Meatball jowl buffalo short loin. Spare ribs pork belly shoulder, flank beef chicken meatball jowl."    },
    {
        name: "Canyon Floor", 
        image: "https://farm1.staticflickr.com/189/493046463_841a18169e.jpg",
        description: "Bacon ipsum dolor amet strip steak pork belly beef salami pig pancetta. Tail shank drumstick ham hock meatloaf ball tip tri-tip brisket salami ground round. Brisket leberkas beef ribs turducken tenderloin cow bacon chicken bresaola meatloaf tri-tip rump drumstick. Turducken shank chuck brisket spare ribs pork belly pork chop t-bone. Meatball jowl buffalo short loin. Spare ribs pork belly shoulder, flank beef chicken meatball jowl."
    }
]
function seedDB(){
    // remove all existing campgrounds
    Campground.deleteMany({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("Campgrounds removed!");
        data.forEach(function(seed){
            Campground.create(seed, function(err, campground){
                if(err){
                    console.log(err);
                } else {
                    console.log("Campground added!");
                    Comment.create(
                        {
                        text: "Nice views but no WiFi",
                        author: "Bob Loblaw"
                        }, function(err, comment){
                            if(err){
                                console.log(err);
                            } else {
                                campground.comments.push(comment);
                                campground.save(function (err){
                                    if(err){
                                        console.log(err);
                                    } else {
                                        console.log("Comment added to campground:");
                                        //console.log(comment);
                                    }
                                });
                                
                            }
                    });
                }
            })
        })
    });
}


module.exports = seedDB;