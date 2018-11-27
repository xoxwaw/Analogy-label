var express = require('express');
var router = express.Router();
var User = require('../modules/User');
var Label = require('../modules/label');
var CompareTwoUsers = require('../modules/compareTwoUser');
var DisagreeBetweenTwoUsers  = require('../modules/disagreeBetweenTwoUsers');
var agree = 0,
    disagree = 0,
    percentage = 0,
    counter = 1;
var sentence = "",
    base = "",
    target = "",
    num_id = -1,
    label = -1;
var mainUsername = "",
    theOtherUsername = "";
var dataSent = {};

function findExistingSentenceLabelledByAnUser(username, sent_id) {
    var toReturn = User.findOne({
            'username': username
        }, {
            'labelled_sentences': {
                $elemMatch: {
                    'num_id': sent_id
                }
            }
        },
        function(err, result) {
            if (err) throw err;
            toReturn = result;
        });
    return toReturn;
}
function compareTwoUsers(users){
    var query1 = findNumberOfSentenceLabelledByAnUser(users[0]);
    var query2 = findNumberOfSentenceLabelledByAnUser(users[1]);
    var user1, user2;
    query1.exec(function(err,data){
        user1 = data["username"];
    });
    query2.exec(function(err,data){
        user2 = data["username"]
    });
    let concat1 = user1 + "labelled_sentences";
    let concat2 = user2 + "labelled_sentences";
    let reconcant1 = '$' + concat1;
    let reconcant2 = '$' + concat2;
    User.aggregate([
        {$project : {
            concat1 : 1,
            concat2 : 1,
            sharedSentences : {
                $setIntersection: [reconcant1, reconcant2 ],
                _id : 0
            }
        }}
    ]);
}
function findNumberOfSentenceLabelledByAnUser(username){
    var toReturn = User.findOne({'username' : username}, function(err,result){
        if (err) throw err;
        toReturn = result;
    });
    return toReturn;
}
function disagreeBetweenUsers(user1Label, user2Label){
    new_disagreement = new DisagreeBetweenTwoUsers({
        num_id : num_id,
        sentence: sentence,
        base : base,
        target: target,
        user1: user1Label,
        user2: user2Label
    });
    new_disagreement.save();
}
function findTwoUsersSimilarity(user1, user2){
    var toReturn = CompareTwoUsers.find({'user1': user1, 'user2': user2}, function(err, data){
        if (err) throw err;
        else if (data.length === 0){
            new_data = new CompareTwoUsers({'user1': user1, 'user2': user2, 'disagreeNum': 0, 'agreeNum': 0});
            new_data.save();
        }
        toReturn = data;
    });
    return toReturn;
}
function updateDisplay() {
    var numOfSentQuery = findNumberOfSentenceLabelledByAnUser('barbeda');
    numOfSentQuery.exec(function(err,result){
        counter = result["number_of_sent"] + 1;
    });
    var query = findExistingSentenceLabelledByAnUser('phnguyen17', counter);
    query.exec(function(err, result) {
        num_id = result['labelled_sentences'][0]['num_id'];
        label = result['labelled_sentences'][0]['label'];
        sentence = String(result['labelled_sentences'][0]['sentence']);
        base = String(result['labelled_sentences'][0]['base']);
        target = String(result['labelled_sentences'][0]['target']);
    });
    var twoUserQuery = findTwoUsersSimilarity('barbeda', 'phnguyen17');
    twoUserQuery.exec(function(err,result){
        console.log(result);
        agree = result[0]['agreeNum'];
        disagree = result[0]['disagreeNum'];
    });
    if (agree + disagree > 0) {
        percentage = agree / (agree + disagree) * 100;
    }
    data = {
        sentence_content: sentence,
        num_id: num_id,
        base: base,
        target: target,
        agree: agree,
        disagree: disagree,
        percentage: percentage
    };
    return data;
}
router.post("/", (req, res) => {
    var thisLabel;
    if (counter > 200){
        res.redirect('/compare/differences');
    }
    if (label === 1) {
        if (req.body.btn === "Yes"){
            agree++;
            thisLabel = 1;
        }
        else if (req.body.btn == "No"){
            disagree++;
            thisLabel = 0;
            disagreeBetweenUsers(0,1);
        }
    } else if (label === 0) {
        if (req.body.btn === "No"){
            agree++;
            thisLabel = 0;
        }
        else if (req.body.btn == "Yes"){
            disagree++;
            thisLabel = 1;
            disagreeBetweenUsers(1,0);
        }
    }
    CompareTwoUsers.updateOne({'user1': 'barbeda', 'user2': 'phnguyen17'}, {
        $set : {'agreeNum': agree, 'disagreeNum': disagree}
    },function(err,data){
        if (err) throw err;
        console.log('updated');
    });
    new_entry = {
        num_id : num_id,
        sentence: sentence,
        base: base,
        target: target,
        label : thisLabel
    };
    Label.updateLabel(new_entry, 'barbeda');
    counter++;
    res.redirect("back");
    // res.sendStatus(201);
});
router.get("/", (req, res) => {
    dataSent = updateDisplay();
    res.render("compare_session", dataSent);
});
router.get("/differences", (req,res) =>{
    DisagreeBetweenTwoUsers.find({}, function(err,data){
        if (err) throw err;
        res.send(data);
    })
});
router.get('/confirmed', (req, res) => {
    dataSent = updateDisplay();
    res.send(dataSent);
});

module.exports = router;
