// This file handles labeling process
var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var app = express();
var username = "",
    corpus = "",
    num_id = global.num_id,
    agree = 0,
    disagree = 0;
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
UserInfo = require('../public/User');
Sentence = require('../public/Sentence');
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
        num_id = global.num_id;
        corpus = global.corpus;
        Sentence.find({"num_id": num_id, "corpus": corpus}, function(err,data){
            if (err) console.log(err);
            else if (data.length == 0) res.redirect("/home");
            else{
                let yesUsers=[], noUsers = [];
                let count = getPercentage(num_id);
                for (var j = 0; j < data[0]["label"].length;j++){
                    if (data[0]["label"][j]["label"] == 1){
                        yesUsers.push(data[0]["label"][j]["user"]);
                    }else if (data[0]["label"][j]["label"]==0){
                        noUsers.push(data[0]["label"][j]["user"]);
                    }
                }
                res.render("label_session",{
                    user: username,
                    sentence_content: data[0]["sentence"],
                    num_id: data[0]["num_id"],
                    base: data[0]["base"],
                    target: data[0]["target"],
                    positive: count[0],
                    negative: count[1],
                    comments: data[0]["comment"],
                    yesUsers: yesUsers,
                    noUsers: noUsers
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
                        res.render("label_session",{
                            user: username,
                            sentence_content: data[0]["sentence"],
                            num_id: data[0]["num_id"],
                            base: data[0]["base"],
                            target: data[0]["target"],
                            positive: 50,
                            negative: 50,
                            comments: data[0]["comment"],
                            yesUsers: [],
                            noUsers: []
                        });
                    }
                });
            }else{
                let numArr = data[0]["labels"][0]["sent_id"];
                global.num_id = findNextId(numArr);
                num_id = global.num_id;
                Sentence.find({"num_id": num_id, "corpus": corpus}, function(err,data){
                    if (err) console.log(err);
                    else if (data.length == 0) res.redirect("/home");
                    else{
                        getPercentage(num_id);

                        res.render("label_session",{
                            user: username,
                            sentence_content: data[0]["sentence"],
                            num_id: data[0]["num_id"],
                            base: data[0]["base"],
                            target: data[0]["target"],
                            positive: 50,
                            negative: 50,
                            comments: data[0]["comment"],
                            yesUsers: [],
                            noUsers: []
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
        global.num_id++;
        num_id = global.num_id;
        var sent_query = sentenceQuery({"num_id": num_id, "corpus": corpus});
        sent_query.exec(function(err,data){
            if (err) console.log(err);
            else if (data.length == 0) res.redirect("/home");
            else{
                // getPercentage(num_id);
                res.render("label_session",{
                    user: username,
                    sentence_content: data[0]["sentence"],
                    num_id: data[0]["num_id"],
                    base: data[0]["base"],
                    target: data[0]["target"],
                    positive: 50,
                    negative: 50,
                    comments: data[0]["comment"],
                    yesUsers: [],
                    noUsers: []
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
router.post("/reply",(req,res)=>{
    if (req.isAuthenticated()){
        console.log(req.body);
        Sentence.updateOne({"num_id": num_id, "corpus": corpus, "comment.time": req.body.comment},
        {$push: {"comment.$.reply": {"username": username, "content": req.body.reply, "time": new Date()}}}, function(err,data){
            if (err) console.log(err);
            else console.log("reply added");
        });
        res.redirect("/label/session");
    }else{
        res.redirect("/home");
    }
});
router.post("/save",(req,res)=>{
    UserInfo.find({"username": username, "labels.corpus": corpus, "labels" :{$elemMatch:{"favorite_id": req.body.submit}}},function(err,data){
        if (err) console.log(err);
        else if (data.length == 0){
            UserInfo.updateOne({"username": username, "labels.corpus": corpus}, {$push: {"labels.$.favorite_id": req.body.submit}},function(err,result){
                if (err) console.log(err);
                else {
                    console.log(req.body.submit);
                }
            });
        }
        global.num_id = req.body.submit;

        res.redirect("/label/session");
    });
});

module.exports = router;
