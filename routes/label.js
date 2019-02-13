var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var app = express();
var username = "",
    corpus = "",
    num_id = "";
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
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

const userSchema = new mongoose.Schema({
    username: String,
    labels : [{
        corpus: String,
        sent_id: []
    }]
});
let User = mongoose.model(
    'label',
    userSchema
);
app.set('view engine', 'ejs');

router.get("/", (req,res)=>{
    if (req.isAuthenticated()){
        username = req.user.username;
        User.find({"username": username, "labels": {$elemMatch :{"corpus": corpus}}},
        function(err,data){
            if (err) console.log(err);
            else if (data.length == 0){
                User.update({"username": username},
                    {$push : {"labels" : {"corpus": corpus, "sent_id": [1]}}});
                num_id = 1;
            }else{
                let indArr = data[0]["labels"][0]["sent_id"];
                num_id = indArr[indArr.length-1] + 1;
            }
        });
        Sentence.find({"num_id": num_id, "corpus": corpus}, function(err,data){
            if (err) console.log(err);
            else if (data.length == 0) res.redirect("/home");
            else{
                res.render("label_session",{
                    sentence_content: data[0]["sentence"],
                    num_id: num_id,
                    base: data[0]["base"],
                    target: data[0]["target"],
                    agree: 0,
                    disagree: 0,
                    percentage: 0
                });
            }
        });
    }else{
        res.redirect("/home");
    }

});
router.post("/", (req,res)=>{
    corpus = req.body.corpora;
    res.redirect("/label");
});

module.exports = router;
