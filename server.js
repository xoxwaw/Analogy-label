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
var global = {num_id: 1, corpus : "Brown"};
app.use(upload.array());
var label = require("./routes/label");
app.use("/label",label);
var queries = require("./routes/query");
app.use("/query",queries);

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
UserInfo = require('./public/User');
function userQuery(user){
    var query = UserInfo.find({"username": user});
    return query;
}
app.get("/home", function(req,res){
    if (req.isAuthenticated()){
        var corpora = [],
            num_sent = [];
        let query = userQuery(req.user.username);
        query.exec(function(err,data){
            if (err) console.log(err);
            for (var i = 0; i < data[0]["labels"].length; i++){
                corpora.push(data[0]["labels"][i]["corpus"]);
                num_sent.push(data[0]["labels"][i]["sent_id"].length);
            }
            res.render("profile",{
                user_name: req.user.username,
                corpora : corpora,
                num_sent : num_sent
            });
        });
    }else{
        res.redirect("/login");
    }
});

app.get("/", (req, res) => {
    res.redirect("/home");
});

app.get("/login", (req,res) => {
    res.render("login", {
        message: ""
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
                res.redirect("/home");
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
