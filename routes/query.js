var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var app = express();
var username = "",
    corpus = "",
    num_id = 0,
    result = {};
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
UserInfo = require('../public/User');
Sentence = require('../public/Sentence');
router.get("/", (req,res) => {
    if (req.isAuthenticated()){
        username = req.user.username;
        res.render("query",{
            user: username,
            result: result;
        });
    }else{
        res.redirect("/home");
    }

});
router.get("/user", (req,res)=>{
    var userQuery = UserInfo.find({"username": req.body.username});
    userQuery.exec(function(err,data){
        if (err) console.log(err);
        else{
            result["num_sent"] = data[0]["labels"].length;
        }
    });
    console.log(result);
});
router.get("/")
module.exports = router;
