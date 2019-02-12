var globalVar = {
    username: ''
};
const express = require('express');

const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

var app = express();
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use(session({
    secret: "Anakin Skywalker",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


var url = "mongodb+srv://admin:Test123@cluster0-msffm.mongodb.net/analogy";
mongoose.connect(url, {useNewUrlParser: true});
mongoose.set("useCreateIndex", true);
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    num_sent : Number
});
userSchema.plugin(passportLocalMongoose);
let User = mongoose.model(
    'user',
     userSchema
);
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
var multer = require('multer'),
    upload = multer();

app.use(upload.array());

let database;
var sentence = "",
    base = "",
    target = "",
    counter = 1,
    username = "";

let port = process.env.PORT;
if (port == null || port == ""){
    port = 8000;
}

app.get("/checkSignin", function(req,res){
    if (req.isAuthenticated()){
        res.render("profile",{
            user_name: req.user.username
        });
    }else{
        console.log("Not signed in");
        res.redirect("/login");
    }
});

app.get("/", (req, res) => {
    res.redirect("/checkSignin");
});

app.get("/login", (req,res) => {
    res.render("login", {
        message: "Hello"
    });
});

app.post("/login", (req,res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function(err){
        if (err) console.log(err);
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/checkSignIn");
            });
        }
    })
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.post('/Yes', (req, res) => {
    label.updateLabel(1, 0, 'phnguyen17');
    res.redirect("/");
});
app.post('/No', (req, res) => {
    label.updateLabel(0, 1, 'phnguyen17');
    res.redirect("/");
});
app.listen(port, () => {
    console.log('Server has started');
});
