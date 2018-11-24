var express = require('express');
var router = express.Router();
var User = require('../modules/User');
var Label = require('../modules/label');
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

function updateDisplay() {
    var query = findExistingSentenceLabelledByAnUser('phnguyen17', counter);
    query.exec(function(err, result) {
        num_id = result['labelled_sentences'][0]['num_id'];
        label = result['labelled_sentences'][0]['label'];
        sentence = String(result['labelled_sentences'][0]['sentence']);
        base = String(result['labelled_sentences'][0]['base']);
        target = String(result['labelled_sentences'][0]['target']);
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
    if (label === 1) {
        if (req.body.btn === "Yes") agree++;
        else if (req.body.btn == "No") disagree++;
    } else if (label === 0) {
        if (req.body.btn === "No") agree++;
        else if (req.body.btn == "Yes") disagree++;
    }
    counter++;
    res.redirect("back");
    // res.sendStatus(201);
});
router.get("/", (req, res) => {
    dataSent = updateDisplay();
    res.render("compare_session", dataSent);
});

router.get('/confirmed', (req, res) => {
    dataSent = updateDisplay();
    res.send(dataSent);
});

module.exports = router;
