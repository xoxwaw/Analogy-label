// This file handles labeling process
var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var app = express();
var username = "",
    corpus = "",
    num_id = "",
    agree = 0,
    disagree = 0;
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
        label: Number
    }],
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
});
let Sentence = mongoose.model(
    'sentence',
     sentenceSchema
);


app.set('view engine', 'ejs');
UserInfo = require('../public/User');
// this function returns the next available index in the database
function findNextId(arr){
    arr.sort();
    if (arr.length == 0) return 1;
    for (var i = 0; i < arr.length; i++){
        if (i != arr[i] - 1) return i+1;
    }
    return arr[arr.length - 1] + 1;
}

function sentenceQuery(command){//return the query from sentence_index, corpus name, and username in the Sentence database
    var query = Sentence.find(command);
    return query;
}

function userQuery(){// return the query from user name and corpus name in user database
    var query = UserInfo.find({"username": username, "labels.corpus": corpus});
    return query;
}
function getPercentage(num_id){
    let positive = 0, negative = 0;
    var posQuery = Sentence.find({"num_id": num_id, "corpus": corpus, "label.label": 1});
    posQuery.exec(function(err,data){
        if (err) console.log(err);
        else agree = data.length;
    });
    var negQuery= Sentence.find({"num_id": num_id, "corpus": corpus, "label.label": 0});
    negQuery.exec(function(err,data){
        if (err) console.log(err);
        else disagree = data.length;
    });
    if (agree + disagree != 0){
        positive = agree / (agree + disagree) * 100;
        negative = 100 - positive;
    }
    // console.log(positive,negative)
    return [positive, negative];
}
function findOneAndUpdate(label){//this function handles the yes and no button
    //get query from sentence database, to check if this user has labeled this sentence
    Sentence.find({"num_id": num_id, "corpus": corpus, "label.user": username},function(err,data){
        if (err) console.log(err);
        else if (data.length == 0){// if this user has not, then add this user to the sentence db, also add the sentence index into the userdb
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
        }else{// if this user has already labeled, then only update the new label from sentence db
            Sentence.updateOne({"num_id": num_id, "label.user": username},
                {$set : {"label.$.label": label}}, function(err, result){
                    if (err) console.log(err);
                    else console.log("entry updated");
                });
        }
    });
    // getPercentage(num_id);
}
router.get("/session", (req,res)=>{
    if (req.isAuthenticated()){
        Sentence.find({"num_id": num_id, "corpus": corpus}, function(err,data){
            if (err) console.log(err);
            else if (data.length == 0) res.redirect("/home");
            else{
                let comments = [], users = [], time = [];
                let count = getPercentage(num_id);
                // console.log(negative, positive);
                for (var i = 0; i< data[0]["comment"].length;i++){
                    comments.push(data[0]["comment"][i]["content"]);
                    users.push(data[0]["comment"][i]["username"]);
                    time.push(data[0]["comment"][i]["time"]);
                }
                res.render("label_session",{
                    sentence_content: data[0]["sentence"],
                    num_id: data[0]["num_id"],
                    base: data[0]["base"],
                    target: data[0]["target"],
                    positive: count[0],
                    negative: count[1],
                    comments: comments,
                    username: users,
                    time: time
                });
            }
        });
    }else{
        res.redirect("/home");
    }
});
router.get("/start_session", (req,res) => {
    if (req.isAuthenticated()){
        username = req.user.username;
        var query = userQuery();
        query.exec(function(err,data){
            if (err) console.log(err);
            else if (data.length == 0){
                UserInfo.updateOne({"username": username},
                    {$push : {"labels" : {"corpus": corpus}}}, function(err, result){
                        if (err) console.log(err);
                        else console.log("Entry added");
                    });
                num_id = 1;
                Sentence.find({"num_id": num_id, "corpus": corpus}, function(err,data){
                    if (err) console.log(err);
                    else if (data.length == 0) res.redirect("/home");
                    else{
                        // getPercentage(num_id);
                        var comments = [], users = [], time = [];
                        for (var i = 0; i< data[0]["comment"].length;i++){
                            comments.push(data[0]["comment"][i]["content"]);
                            users.push(data[0]["comment"][i]["username"]);
                            time.push(data[0]["comment"][i]["time"])
                        }
                        res.render("label_session",{
                            sentence_content: data[0]["sentence"],
                            num_id: data[0]["num_id"],
                            base: data[0]["base"],
                            target: data[0]["target"],
                            positive: 50,
                            negative: 50,
                            comments: comments,
                            username: users,
                            time: time
                        });
                    }
                });
            }else{
                let numArr = data[0]["labels"][0]["sent_id"];
                num_id = findNextId(numArr);
                Sentence.find({"num_id": num_id, "corpus": corpus}, function(err,data){
                    if (err) console.log(err);
                    else if (data.length == 0) res.redirect("/home");
                    else{
                        getPercentage(num_id);
                        let comments = [], users = [], time = [];
                        for (var i = 0; i< data[0]["comment"].length;i++){
                            comments.push(data[0]["comment"][i]["content"]);
                            users.push(data[0]["comment"][i]["username"]);
                            time.push(data[0]["comment"][i]["time"]);
                        }

                        res.render("label_session",{
                            sentence_content: data[0]["sentence"],
                            num_id: data[0]["num_id"],
                            base: data[0]["base"],
                            target: data[0]["target"],
                            positive: 50,
                            negative: 50,
                            comments: comments,
                            username: users,
                            time: time
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
    res.redirect("/label/start_session");;
});
router.post("/Yes",(req,res)=>{
    if (req.isAuthenticated()){
        findOneAndUpdate(1);
        res.redirect('/label/session');
    }else{
        res.redirect("/home");
    }
});
router.post("/No", (req,res) =>{
    if (req.isAuthenticated()){
        findOneAndUpdate(0);
        res.redirect('/label/session');
    }else{
        res.redirect("/home");
    }
});
router.get("/", (req,res)=>{
    if (req.isAuthenticated()){
        num_id++;
        var sent_query = sentenceQuery({"num_id": num_id, "corpus": corpus});
        sent_query.exec(function(err,data){
            if (err) console.log(err);
            else if (data.length == 0) res.redirect("/home");
            else{
                // getPercentage(num_id);
                let comments = [], users = [], time = [];
                for (var i = 0; i< data[0]["comment"].length;i++){
                    comments.push(data[0]["comment"][i]["content"]);
                    users.push(data[0]["comment"][i]["username"]);
                    time.push(data[0]["comment"][i]["time"]);
                }
                res.render("label_session",{
                    sentence_content: data[0]["sentence"],
                    num_id: data[0]["num_id"],
                    base: data[0]["base"],
                    target: data[0]["target"],
                    positive: 50,
                    negative: 50,
                    comments: comments,
                    username: users,
                    time: time
                });
            }
        });

    }else{
        res.redirect("/home");
    }
});
router.post("/comment", (req,res) =>{
    if (req.isAuthenticated()){
        Sentence.update({"num_id": num_id, "corpus": corpus},
            {$push: {"comment": {"username":username, "content": req.body.comment, "time": new Date()}}}, function(err,data){
                if (err) console.log(err);
                else console.log("comment added");
            });
        res.redirect("/label/session");
    }else{
        res.redirect("/home");
    }
});
module.exports = router;
