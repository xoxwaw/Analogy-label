var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var app = express();
var multer = require('multer');
var upload = multer();
var session = require('express-session');
// var cookieParser = require('cookie-parser');
app.use(upload.array());
// app.use(cookieParser());
app.use(session({
    secret: "Your secret key"
}));
const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://admin:Test123@cluster0-msffm.mongodb.net/analogy", {
    useNewUrlParser: true
});
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

User = require('../modules/User');


router.get("/", (req,res) => {
    res.render("login", {
        message: ""
    });
});

router.post("/", (req,res) => {
    User.find({
        'username': req.body.uname
    }, function(err, data) {
        if (err) {
            console.log(err);
            return;
        } else if (data.length === 0) {
            console.log("User don't exist");
            res.render("login", {
                message: "User does not exist"
            });
        } else {
            if (data[0].password === req.body.pwd) {
                req.session.user = data;
                username = req.body.uname;
                // globalVar.username = username
                res.redirect("/home");
            } else {
                res.render("login", {
                    message: "Wrong Password"
                });
            }
        }
    });
});

module.exports = router;
