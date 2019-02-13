var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var app = express();
var username = "";
const sentenceSchema = new mongoose.Schema({
    corpus: String,
    num_id: Number,
    sentence: String,
    base: [String],
    target : [String],
    label: [{
        user: String,
        label: Number,
        comment: String
    }]
});
let Sentence = mongoose.model(
    'sentence',
     sentenceSchema
);
app.set('view engine', 'ejs');

router.get("/", (req,res)=>{
    if (req.isAuthenticated()){
        username = req.user.username;
        Sentence.find({"num_id" : 1}, function(err,result){
            if (err) console.log(err);
            else if (result.length == 0) res.send("<h1>Nothing</h1>");
            else res.send("<h1>"+result[0]["sentence"] + result[0]["corpus"] +"</h1>");
        });
    }else{
        res.redirect("/home");
    }

});
router.post("/", (req,res)=>{

});

module.exports = router;
