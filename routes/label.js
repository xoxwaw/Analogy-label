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
        comment: [{
            username: String,
            time: String,
            content: String,
            reply: [{
                username: String,
                time: String,
                content: String
            }]
        }]
    }]
});
let Sentence = mongoose.model(
    'sentence',
     sentenceSchema
);


app.set('view engine', 'ejs');
UserInfo = require('../public/User');
function findNextId(arr){
    for (var i = 0; i < arr.length; i++){
        if (i != arr[i] - 1) return arr[i]+1;
    }
    return arr[arr.length - 1] + 1;
}

function sentenceQuery(){
    var query = Sentence.find({"num_id": num_id, "corpus": corpus, "label.username": username});
    return query;
}

function userQuery(){
    var query = UserInfo.find({"username": username, "labels.corpus": corpus});
    return query;
}

function findOneAndUpdate(label){
    var query = sentenceQuery();
    query.lean().exec(function(err,data){
        if (err) console.log(err);
        else if (data.length == 0){
            Sentence.updateOne({"num_id": num_id, "corpus": corpus},
                {$push : {"label": {"user": username, "label": label}}}, function(err, result){
                    if (err) console.log(err);
                    else console.log("Entry added to sentence");
                });
            UserInfo.updateOne({"username": username, "labels.corpus": corpus},
                {$push: {"labels.$.sent_id": num_id}},function(err,result){
                    if (err) console.log(err);
                    else console.log("Entry added to user");
                });
        }else{
            Sentence.updateOne({"num_id": num_id, "label.username": username},
                {$set : {"label.$.label": label}}, function(err, result){
                    if (err) console.log(err);
                    else console.log("entry updated");
                });
        }
    });
}
router.get("/", (req,res)=>{
    if (req.isAuthenticated()){
        username = req.user.username;
        var query = userQuery();
        query.exec(function(err,data){
            if (err) console.log(err);
            else if (data.length == 0){
                UserInfo.updateOne({"username": username},
                    {$push : {"labels" : {"corpus": corpus, "sent_id": [1]}}}, function(err, result){
                        if (err) console.log(err);
                        else console.log("Entry added");
                    });
                num_id = 1;
                Sentence.find({"num_id": num_id, "corpus": corpus}, function(err,data){
                    if (err) console.log(err);
                    else if (data.length == 0) res.redirect("/home");
                    else{
                        res.render("label_session",{
                            sentence_content: data[0]["sentence"],
                            num_id: data[0]["num_id"],
                            base: data[0]["base"],
                            target: data[0]["target"],
                            agree: 0,
                            disagree: 0,
                            percentage: 0
                        });
                    }
                });
            }else{
                let indArr = data[0]["labels"][0]["sent_id"];
                num_id = findNextId(indArr);
                console.log(num_id);
                Sentence.find({"num_id": num_id, "corpus": corpus}, function(err,data){
                    if (err) console.log(err);
                    else if (data.length == 0) res.redirect("/home");
                    else{
                        res.render("label_session",{
                            sentence_content: data[0]["sentence"],
                            num_id: data[0]["num_id"],
                            base: data[0]["base"],
                            target: data[0]["target"],
                            agree: 0,
                            disagree: 0,
                            percentage: 0
                        });
                    }
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
router.post("/Yes",(req,res)=>{
    if (req.isAuthenticated()){
        findOneAndUpdate(1);
        res.redirect("/label");
    }else{
        res.redirect("/home");
    }
});
router.post("/No", (req,res) =>{
    if (req.isAuthenticated()){
        findOneAndUpdate(0);
        res.redirect("/label");
    }else{
        res.redirect("/home");
    }
});
module.exports = router;
