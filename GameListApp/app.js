var express = require('express');
var exphbs  = require('express-handlebars');
var app = express();
var methodOverride = require('method-override');
var port = 5000;
var path = require('path');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var router = express.Router();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var {ensureAuthenticated} = require('./helpers/auth');

//Configures routes
var users = require('./routes/users');

//Passportjs Config route
require('./config/passport')(passport);

//gets rid of warning for Mongoose
mongoose.Promise = global.Promise;

//connect to mongodb using mongoose
mongoose.connect("mongodb://localhost:27017/gameentries",{
    useMongoClient:true
})
.then(function(){console.log("MongoDB Connected")})
.catch(function(err){console.log(err)});

//Load in Entry Model
require('./models/Entry');
require('./models/Users');
var Entry = mongoose.model('Entries');
var Users = mongoose.model('Users');

//sets up handlebars as our view engine
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Functions needed to run body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Setup Express Session
app.use(session({
    secret:'secret',
    resave:true,
    saveUninitialized:true
}));

//Setup Passport Middlware
app.use(passport.initialize());
app.use(passport.session());


//configure flash messages
//app.use(flash());
/*
app.use(function(req,res){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});*/

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'));

//Route to index.html
router.get('/', ensureAuthenticated, function(req,res){
    //res.sendFile(path.join(__dirname+'/index.html'));
    //var title = "Welcome to the GameApp Page";

    res.render('index');
});

//Route to entries
router.get('/entries', ensureAuthenticated, function(req,res){
   res.render('gameentries/addgame',{
       user:req.user
    });
});

//Route to Edit Game Entries
router.get('/gameentries/edit/:id', function(req,res){
    Entry.findOne({
        _id:req.params.id
    }).then(function(entry){
         res.render('gameentries/editgame', {
            user:req.user, 
            entry:entry
            });
    });
});

//Route to put edited entry
router.put('/editgame/:id', function(req,res){
    Entry.findOne({
        _id:req.params.id
    }).then(function(entry){
        entry.title = req.body.title;
        entry.genre = req.body.genre;

        entry.save()
        .then(function(idea){
            res.redirect('/');
        })
    });
});

//Route to login
router.get('/login', function(req,res){
    res.render('login');
 });

 router.post('/login', function(req, res, next){
    passport.authenticate('local', {
        successRedirect:'/',
        failureRedirect:'/users/register'
    })(req,res,next);
 });

 router.get('/logout', function(req,res){
     req.logout();
     res.redirect('/login');
 });


 //Index route
 app.get('/',ensureAuthenticated, function(req, res){
    //console.log("request made from fetch");
    Entry.find({user:req.user.id})
    .then(function(entries){
        res.render('index', {
            user:req.user,
            entries:entries
        });
    });

});

//Gamers Route
app.get('/gamers', function(req, res){
    //console.log("request made from fetch");
    Users.find({})
    .then(function(users){
        res.render('gamers', {
            users:users
        });
    });

});



//post from form on index.html
app.post('/addgame', function(req,res){
    console.log(req.body);
    var newEntry = {
        title:req.body.title,
        genre:req.body.genre,
        user:req.user.id
    }
    new Entry(newEntry)
    .save()
    .then(function(entry){
        res.redirect('/')
    });
});

//Delete Game Entry
app.delete('/:id', function(req,res){
    Entry.remove({_id:req.params.id})
    .then(function(){
      //  req.flash("game removed");
        res.redirect('/');
    });
});


//routes for paths
app.use(express.static(__dirname+'/views'));
app.use(express.static(__dirname+'/scripts'));
app.use('/', router);
app.use('/users', users);

//starts server
app.listen(port, function(){
    console.log("Server is running on Port " + port);
});